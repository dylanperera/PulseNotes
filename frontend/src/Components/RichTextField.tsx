import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";

type Props = {
  id?: string;
  text: string;
  setContent: (value: string) => void;
  isRecording: boolean;
  isLoading: boolean;
  placeHolder?: string;
};

function RichTextField({
  text,
  setContent,
  isRecording,
  isLoading,
  placeHolder,
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({
        placeholder: placeHolder ?? "",
      }),
    ],
    content: "",
    editable: !(isRecording || isLoading),

    // User edits
    onUpdate: ({ editor }) => {
      setContent(editor.getText());
    },
  });

  const textToHTML = (raw: string) =>
    raw
      .split("\n\n")
      .map((p) => `<p>${p.replace(/\n/g, "<br />")}</p>`)
      .join("");

  useEffect(() => {
    if (!editor) return;

    if (!isLoading && text && editor.getText() !== text) {
      editor.commands.setContent(textToHTML(text), { emitUpdate: false });
    }
  }, [editor, text, isLoading]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!(isRecording || isLoading));
  }, [editor, isRecording, isLoading]);

  if (!editor) return null;

  return (
    <div className={`rich-text-container ${isRecording || isLoading ? "rich-text-disabled" : ""}`}>
      <div className="rich-text-toolbar">
        <button
          disabled={isRecording || isLoading}
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "active" : ""}
        >
          B
        </button>

        <button
          disabled={isRecording || isLoading}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "active" : ""}
        >
          I
        </button>

        <button
          disabled={isRecording || isLoading}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive("underline") ? "active" : ""}
        >
          U
        </button>
      </div>

      <EditorContent editor={editor} className="rich-text-editor" />
    </div>
  );
}

export default RichTextField;


