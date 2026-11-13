"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const inputClass =
  "border-white/10 bg-white/5 text-white placeholder:text-zinc-600";
const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2MB

/**
 * Profile Information card — avatar upload, display name and password
 * changes write through Better Auth (`authClient.updateUser` /
 * `authClient.changePassword`); email is read-only. Props are plain values
 * (the Mongo user document can't cross the RSC boundary).
 */
export function ProfileInformation({
  name: initialName,
  email,
  image,
}: {
  name: string;
  email: string;
  image: string | null;
}) {
  const router = useRouter();
  const avatarInput = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(initialName);
  const [pending, setPending] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordPending, setPasswordPending] = useState(false);

  async function changeAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error("Image is too large — the limit is 2MB.");
      return;
    }

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

    setPending(true);
    const { error } = await authClient.updateUser({ image: dataUrl });
    setPending(false);

    if (error) {
      toast.error(error.message ?? "Could not update avatar.");
      return;
    }
    toast.success("Avatar updated.");
    router.refresh();
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Name cannot be empty.");
      return;
    }

    setPending(true);
    const { error } = await authClient.updateUser({ name: trimmed });
    setPending(false);

    if (error) {
      toast.error(error.message ?? "Could not update profile.");
      return;
    }

    toast.success("Profile updated.");
    router.refresh();
  }

  async function resetPassword(event: FormEvent) {
    event.preventDefault();

    if (!currentPassword || !newPassword) {
      toast.error("Fill in both password fields.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }

    setPasswordPending(true);
    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });
    setPasswordPending(false);

    if (error) {
      toast.error(error.message ?? "Could not change password.");
      return;
    }

    toast.success("Password updated.");
    setCurrentPassword("");
    setNewPassword("");
    setShowPassword(false);
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-[#141414] p-6">
      <h2 className="text-sm font-semibold">Profile Information</h2>

      {/* Avatar + change action */}
      <div className="mt-5 flex items-center gap-4">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            className="size-16 rounded-full object-cover"
          />
        ) : (
          <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#5b6cf5] to-[#22d3ee] text-sm font-semibold">
            {name
              .split(" ")
              .slice(0, 2)
              .map((part) => part[0]?.toUpperCase() ?? "")
              .join("")}
          </span>
        )}
        <div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={pending}
            onClick={() => avatarInput.current?.click()}
          >
            Change Avatar
          </Button>
          <p className="mt-1.5 text-xs text-zinc-500">
            JPG, PNG, or GIF. Max size of 2MB
          </p>
        </div>
      </div>
      <input
        ref={avatarInput}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
        className="hidden"
        onChange={changeAvatar}
      />

      {/* Name + email */}
      <form onSubmit={onSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="full-name" className="text-xs text-zinc-400">
            Full Name
          </label>
          <Input
            id="full-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs text-zinc-400">
            Email Address
          </label>
          <Input
            id="email"
            value={email}
            readOnly
            disabled
            className={`${inputClass} opacity-60`}
          />
        </div>
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <Button type="submit" size="sm" disabled={pending}>
            Update Profile
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setShowPassword((open) => !open)}
          >
            Reset Password
          </Button>
        </div>
      </form>

      {/* Inline password change */}
      {showPassword && (
        <form
          onSubmit={resetPassword}
          className="mt-4 grid gap-3 border-t border-white/5 pt-4 sm:grid-cols-2"
        >
          <div className="space-y-1.5">
            <label
              htmlFor="current-password"
              className="text-xs text-zinc-400"
            >
              Current Password
            </label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              autoComplete="current-password"
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="new-password" className="text-xs text-zinc-400">
              New Password
            </label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
              className={inputClass}
            />
          </div>
          <div>
            <Button type="submit" size="sm" disabled={passwordPending}>
              {passwordPending ? "Updating…" : "Save Password"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
