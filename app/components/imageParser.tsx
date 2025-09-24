import React, {
    useState,
    useEffect,
    useImperativeHandle,
    forwardRef,
    ForwardRefRenderFunction,
  } from 'react';
  
  export type ClipboardUploadModalRef = {
    open: () => void;
  };
  
  type Props = {
    onPasteImage: (file: File) => void;
  };
  
  const ClipboardUploadModal: ForwardRefRenderFunction<
    ClipboardUploadModalRef,
    Props
  > = ({ onPasteImage }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
  
    const open = () => setIsOpen(true);
    const close = () => setIsOpen(false);
  
    useImperativeHandle(ref, () => ({ open }));
  
    useEffect(() => {
      const handlePaste = (event: ClipboardEvent) => {
        if (!isOpen) return;
  
        const items = event.clipboardData?.items;
        if (!items) return;
  
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.type.indexOf('image') === 0) {
            const file = item.getAsFile();
            if (file) {
              onPasteImage(file);
              close();
            }
            break;
          }
        }
      };
  
      window.addEventListener('paste', handlePaste);
      return () => {
        window.removeEventListener('paste', handlePaste);
      };
    }, [isOpen, onPasteImage]);
  
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 shadow-lg w-96 text-center">
          <h2 className="text-lg font-semibold mb-4">Paste an Image (Ctrl+V)</h2>
          <p className="text-sm text-gray-600">Copy an image or screenshot, then press <strong>Ctrl+V</strong>.</p>
          <button
            onClick={close}
            className="mt-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };
  
  export default forwardRef(ClipboardUploadModal);
  