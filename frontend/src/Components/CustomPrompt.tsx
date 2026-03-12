import { useRef } from 'react';

type CustomPromptProps = {
    isLoading: boolean;
    prompt: string;
    setPrompt: (prompt: string) => void;
}

export default function CustomPrompt({isLoading, prompt, setPrompt}: CustomPromptProps)
{
    const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setPrompt(e.target.value);
    }

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const startY = useRef(0);
    const startHeight = useRef(0);

    const startResize = (e: React.MouseEvent) => {
        startY.current = e.clientY;
        startHeight.current = textareaRef.current!.offsetHeight;

        document.addEventListener("mousemove", resize);
        document.addEventListener("mouseup", stopResize);
    };

    const resize = (e: MouseEvent) => {
        const diff = startY.current - e.clientY;
        textareaRef.current!.style.height = `${startHeight.current + diff}px`;
    };

    const stopResize = () => {
        document.removeEventListener("mousemove", resize);
        document.removeEventListener("mouseup", stopResize);
    };

    return (
        <div className="custom-prompt-wrapper">
            <div className="resize-bar" onMouseDown={startResize}></div>

            <textarea disabled={isLoading}
                      className={`custom-prompt ${ isLoading === true ? 'disabled' : ''}`}
                      onChange={handlePromptChange}
                      ref={textareaRef}>
                    {prompt}
            </textarea>
        </div>
    )
}