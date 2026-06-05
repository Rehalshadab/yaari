"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";
import {
  listenForIncomingCalls,
  acceptCall,
  rejectCall,
} from "@/lib/firestore";

interface IncomingCall {
  id: string;
  callerId: string;
  type: "audio" | "video";
  status: string;
}

interface CallContextType {
  incomingCall: IncomingCall | null;
  handleAccept: () => Promise<void>;
  handleReject: () => Promise<void>;
  setIncomingCall: (call: IncomingCall | null) => void;
}

const CallContext = createContext<CallContextType>({
  incomingCall: null,
  handleAccept: async () => {},
  handleReject: async () => {},
  setIncomingCall: () => {},
});

export function CallProvider({ children }: { children: ReactNode }) {
  const { user, userData } = useAuth();
  const router = useRouter();
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);

  useEffect(() => {
    if (!user || userData?.gender !== "female") return;
    const unsub = listenForIncomingCalls(user.uid, (call) => {
      setIncomingCall({
        id: call.id,
        callerId: call.callerId,
        type: call.type,
        status: call.status,
      });
    });
    return () => unsub();
  }, [user, userData?.gender]);

  const handleAccept = useCallback(async () => {
    if (!incomingCall) return;
    await acceptCall(incomingCall.id);
    router.push(`/call/${incomingCall.id}`);
    setIncomingCall(null);
  }, [incomingCall, router]);

  const handleReject = useCallback(async () => {
    if (!incomingCall) return;
    await rejectCall(incomingCall.id);
    setIncomingCall(null);
  }, [incomingCall]);

  return (
    <CallContext.Provider
      value={{ incomingCall, handleAccept, handleReject, setIncomingCall }}
    >
      {children}
    </CallContext.Provider>
  );
}

export const useCall = () => useContext(CallContext);
