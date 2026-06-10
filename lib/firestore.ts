import {
  collection, doc, setDoc, getDoc, getDocs, updateDoc, query,
  where, orderBy, serverTimestamp, addDoc, onSnapshot, limit,
  increment, runTransaction,
} from "firebase/firestore";
import { db, storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const ADMIN_COMMISSION = 0.2;
const COST_PER_MINUTE_AUDIO = 10;
const COST_PER_MINUTE_VIDEO = 15;

export { ADMIN_COMMISSION, COST_PER_MINUTE_AUDIO, COST_PER_MINUTE_VIDEO };

export const createUserProfile = async (
  uid: string,
  data: {
    displayName: string; email: string; phone: string;
    gender: "male" | "female"; photoURL?: string;
  }
) => {
  const base = {
    uid, displayName: data.displayName, email: data.email, phone: data.phone,
    gender: data.gender, photoURL: data.photoURL || "", bio: "",
    createdAt: Date.now(), coins: 0, earnings: 0, totalEarned: 0,
    totalMinutes: 0, callCount: 0, isActive: true,
    activeModes: { audio: false, video: false }, online: false,
  };
  if (data.gender === "female") {
    await setDoc(doc(db, "users", uid), { ...base, upiId: "", totalWithdrawn: 0 });
  } else {
    await setDoc(doc(db, "users", uid), { ...base, totalSpent: 0 });
  }
};

export const getUserProfile = async (uid: string) => {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
};

export const listenToUser = (uid: string, cb: (d: any) => void) =>
  onSnapshot(doc(db, "users", uid), (s) => { if (s.exists()) cb(s.data()); });

export const updateUserStatus = async (uid: string, data: any) =>
  updateDoc(doc(db, "users", uid), data);

export const setUserOnline = async (uid: string, online: boolean) => {
  try {
    await updateDoc(doc(db, "users", uid), { online });
  } catch {
    await setDoc(doc(db, "users", uid), { online, uid, createdAt: Date.now() }, { merge: true });
  }
};

export const findRandomFemale = async (mode: "audio" | "video") => {
  const q = query(
    collection(db, "users"),
    where("gender", "==", "female"), where("isActive", "==", true),
    where(`activeModes.${mode}`, "==", true), where("online", "==", true), limit(50)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const females = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return females[Math.floor(Math.random() * females.length)];
};

export const createCall = async (callerId: string, receiverId: string, type: "audio" | "video") => {
  const callRef = doc(collection(db, "calls"));
  await setDoc(callRef, {
    callerId, receiverId, type, status: "ringing",
    startedAt: null, endedAt: null, duration: 0,
    costPerMinute: type === "audio" ? COST_PER_MINUTE_AUDIO : COST_PER_MINUTE_VIDEO,
    totalCost: 0, femaleEarnings: 0, adminEarnings: 0,
    recordingUrl: "", createdAt: Date.now(),
  });
  return callRef.id;
};

export const listenForIncomingCalls = (userId: string, cb: (c: any) => void) =>
  onSnapshot(
    query(collection(db, "calls"), where("receiverId", "==", userId), where("status", "==", "ringing")),
    (snap) => snap.docChanges().forEach((c) => { if (c.type === "added") cb({ id: c.doc.id, ...c.doc.data() }); })
  );

export const listenToCall = (callId: string, cb: (c: any) => void) =>
  onSnapshot(doc(db, "calls", callId), (s) => { if (s.exists()) cb({ id: s.id, ...s.data() }); });

export const acceptCall = async (callId: string) =>
  updateDoc(doc(db, "calls", callId), { status: "accepted", startedAt: Date.now() });

export const rejectCall = async (callId: string) =>
  updateDoc(doc(db, "calls", callId), { status: "rejected" });

export const endCall = async (callId: string) => {
  const callRef = doc(db, "calls", callId);
  await runTransaction(db, async (tx) => {
    const callSnap = await tx.get(callRef);
    if (!callSnap.exists()) return;
    const call = callSnap.data();
    if (call.status === "ended") return;
    const now = Date.now();
    const durationSec = Math.floor((now - (call.startedAt || now)) / 1000);
    const durationMin = Math.ceil(durationSec / 60);
    const totalCost = durationMin * call.costPerMinute;
    const adminEarnings = Math.floor(totalCost * ADMIN_COMMISSION);
    const femaleEarnings = totalCost - adminEarnings;

    const callerSnap = await tx.get(doc(db, "users", call.callerId));
    const receiverSnap = await tx.get(doc(db, "users", call.receiverId));
    if (!callerSnap.exists() || !receiverSnap.exists()) return;

    const caller = callerSnap.data();
    const actualDeduction = Math.min(totalCost, caller.coins || 0);

    tx.update(callRef, {
      status: "ended", endedAt: now, duration: durationSec,
      totalCost: actualDeduction,
      femaleEarnings: Math.floor(actualDeduction * (1 - ADMIN_COMMISSION)),
      adminEarnings: Math.floor(actualDeduction * ADMIN_COMMISSION),
    });

    tx.update(doc(db, "users", call.callerId), {
      coins: increment(-actualDeduction), totalSpent: increment(actualDeduction),
      totalMinutes: increment(durationSec / 60), callCount: increment(1),
    });
    tx.update(doc(db, "users", call.receiverId), {
      earnings: increment(femaleEarnings), totalEarned: increment(femaleEarnings),
      totalMinutes: increment(durationSec / 60), callCount: increment(1),
    });
  });
};

export const addCoins = async (uid: string, coinAmount: number, upiTxnId: string) => {
  await addDoc(collection(db, "transactions"), {
    userId: uid, type: "deposit", coins: coinAmount, upiTxnId, status: "pending", createdAt: Date.now(),
  });
};

export const approveTransaction = async (txnId: string, uid: string, coinAmount: number) => {
  await updateDoc(doc(db, "users", uid), { coins: increment(coinAmount) });
  await updateDoc(doc(db, "transactions", txnId), { status: "completed" });
};

export const getAllTransactions = async () => {
  const snap = await getDocs(query(collection(db, "transactions"), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const requestWithdrawal = async (uid: string, amount: number, upiId: string) => {
  const userRef = doc(db, "users", uid);
  await runTransaction(db, async (tx) => {
    const userSnap = await tx.get(userRef);
    if (!userSnap.exists()) throw new Error("User not found");
    const user = userSnap.data();
    if ((user.earnings || 0) < amount) throw new Error("Insufficient earnings");
    tx.update(userRef, { earnings: increment(-amount), totalWithdrawn: increment(amount) });
    await addDoc(collection(db, "withdrawals"), {
      userId: uid, amount, upiId, status: "pending", createdAt: Date.now(),
    });
  });
};

export const saveRecordingUrl = async (callId: string, url: string) =>
  updateDoc(doc(db, "calls", callId), { recordingUrl: url });

export const uploadRecording = async (callId: string, blob: Blob) => {
  const storageRef = ref(storage, `recordings/${callId}.webm`);
  await uploadBytes(storageRef, blob);
  const url = await getDownloadURL(storageRef);
  await saveRecordingUrl(callId, url);
  return url;
};

export const getCallHistory = async (userId: string) => {
  const [s1, s2] = await Promise.all([
    getDocs(query(collection(db, "calls"), where("callerId", "==", userId), orderBy("createdAt", "desc"))),
    getDocs(query(collection(db, "calls"), where("receiverId", "==", userId), orderBy("createdAt", "desc"))),
  ]);
  return [...s1.docs.map((d) => ({ id: d.id, ...d.data() })),
          ...s2.docs.map((d) => ({ id: d.id, ...d.data() }))]
    .sort((a: any, b: any) => b.createdAt - a.createdAt);
};

export const addCallSignalingData = async (callId: string, type: "offer" | "answer" | "ice-candidate", data: any, senderId: string) =>
  addDoc(collection(db, "calls", callId, "signaling"), { type, data: JSON.stringify(data), senderId, createdAt: serverTimestamp() });

export const listenToSignaling = (callId: string, cb: (d: any) => void) =>
  onSnapshot(
    query(collection(db, "calls", callId, "signaling"), orderBy("createdAt", "asc")),
    (snap) => snap.docChanges().forEach((c) => { if (c.type === "added") cb({ id: c.doc.id, ...c.doc.data() }); })
  );

export const getAllUsers = async () => {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getAllCalls = async () => {
  const snap = await getDocs(query(collection(db, "calls"), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getAllWithdrawals = async () => {
  const snap = await getDocs(query(collection(db, "withdrawals"), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const approveWithdrawal = async (withdrawalId: string) =>
  updateDoc(doc(db, "withdrawals", withdrawalId), { status: "completed" });
