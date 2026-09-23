import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, X, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
      setShowPassword(false);
      setShake(false);
    }
  }, [isOpen]);

  // Support pressing Escape to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (password === '123456') {
      setError('');
      onSuccess();
      onClose();
    } else {
      setError('密码错误，请核对后重试');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      inputRef.current?.select();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171717]/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        // Clicking backdrop outside modal dialog dismisses the modal
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`relative w-full max-w-md bg-[#FFFFFF] border-2 border-[#171717] rounded-2xl p-6 sm:p-7 shadow-[8px_8px_0_#171717] transition-transform text-center ${
          shake ? 'translate-x-1 animate-pulse' : ''
        }`}
      >
        {/* Close Button at top-right */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-1 text-[#5F5E5A] hover:text-[#171717] rounded-lg hover:bg-[#EDE8DC] border border-transparent hover:border-[#171717] transition-all cursor-pointer"
          title="关闭 (Esc)"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header - Clean & Centered without technical terms */}
        <div className="flex flex-col items-center justify-center mb-5 pt-1">
          <h3 className="text-lg font-bold text-[#171717] tracking-tight">
            登录管理你的工作台
          </h3>
          <p className="text-xs text-[#5F5E5A] mt-1">
            请输入密码登录，管理你的工作台内容和布局。
          </p>
        </div>

        {/* Form Body - Centered & Single Line for Label + Input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            <label
              htmlFor="admin-password-input"
              className="text-xs font-mono font-bold text-[#171717] shrink-0 whitespace-nowrap flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#5F5E5A]" />
              <span>登录密码:</span>
            </label>

            <div className="relative flex-1 max-w-[240px]">
              <input
                id="admin-password-input"
                ref={inputRef}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="请输入密码"
                className={`w-full h-10 px-3.5 pr-9 text-sm font-mono text-[#171717] bg-[#FAFAF8] border-2 rounded-xl transition-all ${
                  error
                    ? 'border-[#E05252] bg-[#FFF5F5] focus:ring-2 focus:ring-[#E05252]/20'
                    : 'border-[#D3D1C7] hover:border-[#888780] focus:border-[#171717] focus:bg-[#FFFFFF] focus:shadow-[3px_3px_0_#171717] focus:ring-2 focus:ring-[#FFD84D]/40'
                } focus:outline-none`}
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#5F5E5A] hover:text-[#171717] cursor-pointer"
                title={showPassword ? '隐藏密码' : '显示密码'}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-[#E05252] font-medium pt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Footer Actions - Centered Submit button only (cancel via backdrop or X) */}
          <div className="flex items-center justify-center pt-4 border-t border-[#EDE8DC]">
            <button
              type="submit"
              className="v4-btn v4-btn-yellow px-8 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-[3px_3px_0_#171717]"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>确认登录</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
