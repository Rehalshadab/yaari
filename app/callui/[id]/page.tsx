"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  listenToCall, endCall, getUserProfile,
  addCallSignalingData, listenToSignaling, uploadRecording,
} from "@/lib/firestore";
import { FiPhoneOff, FiMic, FiMicOff, FiVideo, FiVideoOff } from "react-icons/fi";
import toast from "react-hot-toast";

let pc: RTCPeerConnection | null = null;
let localStream: MediaStream | null = null;
let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: Blob[] = [];

const RTC_CONFIG = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
};

export default function CallPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [call, setCall] = useState<any>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const initRef = useRef(false);

  useEffect(() => {
    if (!id || !user || initRef.current) return;
    initRef.current = true;

    const unsubCall = listenToCall(id as string, async (callData) => {
      setCall(callData);
      const oid = callData.callerId === user.uid ? callData.receiverId : callData.callerId;
      if (!otherUser && oid) {
        const profile = await getUserProfile(oid);
        if (profile) setOtherUser(profile);
      }
      if (callData.status === "rejected") { toast.error("Call was declined"); router.push("/dashboard"); return; }
      if (callData.status === "ended") {
        if (recordedChunks.length > 0) {
          const blob = new Blob(recordedChunks, { type: "video/webm" });
          await uploadRecording(id as string, blob);
        }
        router.push("/dashboard"); return;
      }
    });
    return () => { unsubCall(); cleanup(); };
  }, [id, user]);

  useEffect(() => {
    if (!call || !user || call.status !== "accepted") return;

    const startCall = async () => {
      try {
        const isCaller = call.callerId === user.uid;
        localStream = await navigator.mediaDevices.getUserMedia({
          audio: true, video: call.type === "video",
        });
        if (localVideoRef.current) localVideoRef.current.srcObject = localStream;

        pc = new RTCPeerConnection(RTC_CONFIG);
        localStream.getTracks().forEach((t) => pc?.addTrack(t, localStream!));

        const remoteStream = new MediaStream();
        pc.ontrack = (event) => {
          event.streams[0].getTracks().forEach((t) => remoteStream.addTrack(t));
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
          startRecording(remoteStream);
        };

        pc.onicecandidate = (event) => {
          if (event.candidate && id) addCallSignalingData(id as string, "ice-candidate", event.candidate, user.uid);
        };
        pc.onconnectionstatechange = () => { if (pc?.connectionState === "connected") setIsConnecting(false); };

        const unsubSignal = listenToSignaling(id as string, async (data) => {
          if (data.senderId === user.uid) return;
          try {
            const parsed = JSON.parse(data.data);
            if (data.type === "offer" && !isCaller) {
              await pc?.setRemoteDescription(new RTCSessionDescription(parsed));
              const answer = await pc!.createAnswer();
              await pc!.setLocalDescription(answer);
              await addCallSignalingData(id as string, "answer", answer, user.uid);
            } else if (data.type === "answer" && isCaller) {
              await pc?.setRemoteDescription(new RTCSessionDescription(parsed));
            } else if (data.type === "ice-candidate") {
              await pc?.addIceCandidate(new RTCIceCandidate(parsed));
            }
          } catch {}
        });

        if (isCaller) {
          const offer = await pc!.createOffer();
          await pc!.setLocalDescription(offer);
          await addCallSignalingData(id as string, "offer", offer, user.uid);
        }
        return () => unsubSignal();
      } catch {
        toast.error("Failed to access camera/mic");
        router.push("/dashboard");
      }
    };
    startCall();
  }, [call?.status, id, user]);

  const startRecording = (stream: MediaStream) => {
    try {
      recordedChunks = [];
      const combined = new MediaStream([
        ...(localStream?.getAudioTracks() || []), ...(localStream?.getVideoTracks() || []),
        ...stream.getAudioTracks(), ...stream.getVideoTracks(),
      ]);
      const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus") ? "video/webm;codecs=vp9,opus"
        : MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus") ? "video/webm;codecs=vp8,opus"
        : MediaRecorder.isTypeSupported("video/webm;codecs=opus") ? "video/webm;codecs=opus"
        : "video/webm";
      mediaRecorder = new MediaRecorder(combined, { mimeType: mime });
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) recordedChunks.push(e.data); };
      mediaRecorder.start(1000);
      setIsRecording(true);
    } catch { console.log("Recording not supported"); }
  };

  useEffect(() => {
    if (!call?.startedAt) return;
    const interval = setInterval(() => setDuration(Math.floor((Date.now() - call.startedAt) / 1000)), 1000);
    return () => clearInterval(interval);
  }, [call?.startedAt]);

  const cleanup = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") mediaRecorder.stop();
    if (pc) { pc.close(); pc = null; }
    if (localStream) { localStream.getTracks().forEach((t) => t.stop()); localStream = null; }
  };

  const handleEndCall = async () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") mediaRecorder.stop();
    if (id) await endCall(id as string);
    cleanup();
    router.push("/dashboard");
  };

  const toggleMute = () => {
    if (localStream) { localStream.getAudioTracks().forEach((t) => (t.enabled = isMuted)); setIsMuted(!isMuted); }
  };
  const toggleVideo = () => {
    if (localStream) { localStream.getVideoTracks().forEach((t) => (t.enabled = isVideoOff)); setIsVideoOff(!isVideoOff); }
  };
  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60); const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (!call) return <div className="flex items-center justify-center min-h-screen bg-black"><div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" /></div>;

  const isRinging = call.status === "ringing";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black relative overflow-hidden">
      {call.type === "video" && remoteVideoRef.current?.srcObject
        ? <video ref={remoteVideoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
        : <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-pink-900" />}

      <div className="relative z-10 flex flex-col items-center gap-6">
        {call.type === "video" && (
          <div className="absolute top-4 right-4 w-32 h-48 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl">
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          </div>
        )}


        {call.type === "audio" && (
          <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-4xl animate-ring-pulse shadow-lg shadow-purple-500/50">
            {otherUser?.displayName?.charAt(0).toUpperCase() || "?"}
          </div>
        )}

        {isRinging ? (
          <>
            <p className="text-white text-xl font-semibold">Calling {otherUser?.displayName || "..."}</p>
            <div className="flex gap-2">{[0, 1, 2].map((i) => <div key={i} className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />)}</div>
            <button onClick={handleEndCall} className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition shadow-lg">
              <FiPhoneOff size={24} className="text-white" />
            </button>
          </>
        ) : (
          <>
            <p className="text-white text-xl font-semibold">{otherUser?.displayName || "Connected"}</p>
            <p className="text-white/60 text-lg font-mono">{formatDuration(duration)}</p>
            <div className="flex items-center gap-6 mt-4">
              <button onClick={toggleMute}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition shadow-lg ${isMuted ? "bg-red-500 text-white" : "bg-white/10 text-white hover:bg-white/20"}`}>
                {isMuted ? <FiMicOff size={22} /> : <FiMic size={22} />}
              </button>
              {call.type === "video" && (
                <button onClick={toggleVideo}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition shadow-lg ${isVideoOff ? "bg-red-500 text-white" : "bg-white/10 text-white hover:bg-white/20"}`}>
                  {isVideoOff ? <FiVideoOff size={22} /> : <FiVideo size={22} />}
                </button>
              )}
              <button onClick={handleEndCall} className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition shadow-lg shadow-red-500/30">
                <FiPhoneOff size={24} className="text-white" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
