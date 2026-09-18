"use client";

/** Shared look for the read-only value boxes and the inputs that replace them. */
export const FIELD_BOX_CLASS =
  "h-12 w-full rounded-xl border border-[#E4E4E7] bg-[#FAFAFA] px-[15px] text-[14px] leading-5 text-[#71717B]";

export default function ProfileField({
  label,
  isEditing,
  onEdit,
  onCancel,
  /** Hides the Edit affordance for fields this account can't change yet. */
  editable = true,
  value,
  children,
}: {
  label: string;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  editable?: boolean;
  /** Rendered in the read-only box when not editing. */
  value: React.ReactNode;
  /** The edit form, shown in place of the box while editing. */
  children?: React.ReactNode;
}) {
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex items-center gap-6">
        <h3 className="text-[16px] font-semibold leading-6 text-[#030303]">{label}</h3>
        {editable && (
          <button
            type="button"
            onClick={isEditing ? onCancel : onEdit}
            className="text-[12px] leading-[18px] text-[#155DFC] hover:underline"
          >
            {isEditing ? "Cancel" : "Edit"}
          </button>
        )}
      </div>

      {isEditing ? (
        children
      ) : (
        <div className={`${FIELD_BOX_CLASS} flex items-center`}>
          <span className="truncate">{value}</span>
        </div>
      )}
    </div>
  );
}
