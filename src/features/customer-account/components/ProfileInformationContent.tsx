"use client";

import { useState } from "react";
import { useCustomerSession } from "@/features/customer-auth/hooks/useCustomerSession";
import {
  setCustomerPassword,
  updateCustomerEmail,
  updateCustomerProfile,
} from "@/features/customer-auth/services/authService";
import { updateCustomer, type Customer } from "@/lib/customerSession";
import ProfileField, { FIELD_BOX_CLASS } from "./ProfileField";
import PhoneEditForm from "./PhoneEditForm";

type EditableField = "name" | "phone" | "email" | "password";

/** The two options the design offers. The model also allows Other/PreferNotToSay. */
const GENDER_OPTIONS: Customer["gender"][] = ["Male", "Female"];

function SaveRow({
  isBusy,
  onSave,
  onCancel,
  saveLabel = "Save",
}: {
  isBusy: boolean;
  onSave: () => void;
  onCancel: () => void;
  saveLabel?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onSave}
        disabled={isBusy}
        className="rounded-full bg-brand-primary px-4 py-1.5 text-[14px] font-medium text-white disabled:opacity-60"
      >
        {isBusy ? "Saving…" : saveLabel}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="text-[14px] font-medium text-[#71717B] hover:underline"
      >
        Cancel
      </button>
    </div>
  );
}

export default function ProfileInformationContent() {
  const { session } = useCustomerSession();

  const [editing, setEditing] = useState<EditableField | null>(null);
  const [draft, setDraft] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function startEditing(field: EditableField, initial: string) {
    setEditing(field);
    setDraft(initial);
    setError(null);
    setNotice(null);
  }

  function stopEditing() {
    setEditing(null);
    setDraft("");
    setError(null);
  }

  /** Every save funnels through here so the store, the busy flag and the error banner stay in step. */
  async function runSave(action: () => Promise<Customer | void>, successNotice?: string) {
    if (!session) return;
    setIsBusy(true);
    setError(null);
    try {
      const updated = await action();
      if (updated) updateCustomer(updated);
      setNotice(successNotice ?? "Saved.");
      stopEditing();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save that. Try again.");
    } finally {
      setIsBusy(false);
    }
  }

  if (!session) return null;

  const hasPassword = session.authProviders?.some((provider) => provider.provider === "local");

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
      {/* Left column — the form */}
      <section className="flex min-w-0 flex-1 flex-col gap-4">
        <h1 className="text-[24px] font-semibold leading-8 text-[#030303]">Profile Information</h1>

        <div className="rounded-[20px] border border-[#E4E4E7] bg-white p-[19px]">
          <div className="flex w-full max-w-[464px] flex-col gap-8">
            {/* Full name + gender */}
            <div className="flex flex-col gap-4">
              <ProfileField
                label="Full Name"
                isEditing={editing === "name"}
                onEdit={() => startEditing("name", session.name ?? "")}
                onCancel={stopEditing}
                value={session.name || "Not set"}
              >
                <div className="flex flex-col gap-3">
                  <input
                    aria-label="Full name"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    maxLength={120}
                    className={`${FIELD_BOX_CLASS} text-[#030303] outline-none focus:border-brand-primary`}
                  />
                  <SaveRow
                    isBusy={isBusy}
                    onCancel={stopEditing}
                    onSave={() => {
                      const name = draft.trim();
                      if (!name) {
                        setError("Name can't be empty.");
                        return;
                      }
                      runSave(() => updateCustomerProfile(session.id, { name }));
                    }}
                  />
                </div>
              </ProfileField>

              {/* Gender saves on selection — the design gives it no Edit control of its own. */}
              <fieldset className="flex flex-col gap-3">
                <legend className="text-[14px] leading-5 text-[#71717B]">Your Gender</legend>
                <div className="flex items-center gap-3">
                  {GENDER_OPTIONS.map((option) => (
                    <label key={option} className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="gender"
                        value={option}
                        checked={session.gender === option}
                        disabled={isBusy}
                        onChange={() => runSave(() => updateCustomerProfile(session.id, { gender: option }))}
                        className="h-[18px] w-[18px] accent-brand-primary"
                      />
                      <span className="text-[12px] leading-[18px] text-[#71717B]">{option}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            {/* Mobile */}
            <ProfileField
              label="Mobile Number"
              isEditing={editing === "phone"}
              onEdit={() => startEditing("phone", "")}
              onCancel={stopEditing}
              value={session.phone || "Not set"}
            >
              <PhoneEditForm
                onCancel={stopEditing}
                onSaved={(customer) => {
                  updateCustomer(customer);
                  setNotice("Mobile number updated.");
                  stopEditing();
                }}
              />
            </ProfileField>

            {/* Email */}
            <ProfileField
              label="Email"
              isEditing={editing === "email"}
              onEdit={() => startEditing("email", session.email ?? "")}
              onCancel={stopEditing}
              value={session.email || "Not set"}
            >
              <div className="flex flex-col gap-3">
                <input
                  type="email"
                  autoComplete="email"
                  aria-label="Email address"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  className={`${FIELD_BOX_CLASS} text-[#030303] outline-none focus:border-brand-primary`}
                />
                <p className="text-[12px] leading-[18px] text-[#71717B]">
                  Changing this marks the address unverified.
                </p>
                <SaveRow
                  isBusy={isBusy}
                  onCancel={stopEditing}
                  onSave={() => {
                    const email = draft.trim();
                    if (!email) {
                      setError("Email can't be empty.");
                      return;
                    }
                    runSave(
                      () => updateCustomerEmail(session.id, email),
                      "Email updated — it's not verified yet."
                    );
                  }}
                />
              </div>
            </ProfileField>

            {/* Password */}
            <ProfileField
              label="Password"
              isEditing={editing === "password"}
              onEdit={() => startEditing("password", "")}
              onCancel={stopEditing}
              value={hasPassword ? "••••••••" : "Not set"}
            >
              <div className="flex flex-col gap-3">
                <input
                  type="password"
                  autoComplete="new-password"
                  aria-label="New password"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="At least 8 characters"
                  className={`${FIELD_BOX_CLASS} text-[#030303] outline-none focus:border-brand-primary`}
                />
                <SaveRow
                  isBusy={isBusy}
                  onCancel={stopEditing}
                  saveLabel={hasPassword ? "Update password" : "Set password"}
                  onSave={() => {
                    if (draft.length < 8) {
                      setError("Password must be at least 8 characters.");
                      return;
                    }
                    runSave(() => setCustomerPassword(draft), "Password updated.");
                  }}
                />
              </div>
            </ProfileField>

            {error && <p className="text-[12px] leading-[18px] text-[#C81E0D]">{error}</p>}
            {notice && !error && (
              <p className="text-[12px] leading-[18px] text-[#008236]">{notice}</p>
            )}
          </div>
        </div>
      </section>

      {/* Right column — FAQs. The design ships this card empty, so it stays a
          shell until someone supplies the questions. */}
      <section className="flex w-full flex-col gap-4 lg:w-[316px] lg:shrink-0">
        <h2 className="text-[24px] font-semibold leading-8 text-[#030303]">FAQs</h2>
        <div className="min-h-[200px] rounded-[20px] border border-[#E4E4E7] bg-white lg:min-h-[538px]" />
      </section>
    </div>
  );
}
