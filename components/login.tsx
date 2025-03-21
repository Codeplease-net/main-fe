import { auth, googleProvider, facebookProvider, githubProvider } from "@/api/Readfirebase";
import { signInWithPopup, User } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalClose } from "@/components/ui/modal";
import { Github, Facebook, Chrome, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import nookies from "nookies";

export default function Login({ isOpen, onClose, redirectDes }: { isOpen: boolean; onClose: () => void; redirectDes: string }) {
  const [cookieConsent, setCookieConsent] = useState(false);
  const [user, setUser] = useState<null | User>(null);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (consent === "true") {
      setCookieConsent(true);
    }
  }, []);

  const askForCookieConsent = () => {
    const userConsent = confirm("Do you allow us to use cookies for login?");
    if (userConsent) {
      localStorage.setItem("cookieConsent", "true");
      setCookieConsent(true);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user ? user : null);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (provider: any) => {
    if (!cookieConsent) {
      askForCookieConsent();
    }
    if (cookieConsent) {
      try {
        const result = await signInWithPopup(auth, provider);
        const token = await result.user.getIdToken();
        nookies.set(null, "token", token, { maxAge: 30 * 24 * 60 * 60, path: "/", secure: true });
        window.location.href = redirectDes;
      } catch (error) {
        console.error("Error signing in:", error);
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} className="max-w-sm" open={false}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Sign In</ModalTitle>
          <ModalClose />
        </ModalHeader>
        <div className="flex flex-col gap-3 mt-4">
          <Button variant="outline" className="w-full flex items-center gap-3 hover:bg-primary" onClick={() => handleLogin(googleProvider)}>
            <Mail className="h-6 w-6" /> Gmail
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
}
