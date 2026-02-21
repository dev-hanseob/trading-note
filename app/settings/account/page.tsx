'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { User, Lock, Mail, Crown, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/Toast';
import apiClient from '@/lib/api/client';

export default function AccountSettingsPage() {
    const { user } = useAuth();
    const { showToast } = useToast();

    const [name, setName] = useState(user?.name || '');
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSavingPassword, setIsSavingPassword] = useState(false);

    const currentPlan = 'Free';

    const handleProfileSave = async (e: FormEvent) => {
        e.preventDefault();
        setIsSavingProfile(true);
        try {
            await apiClient.put('/auth/profile', { name: name.trim() });
            showToast('프로필이 저장되었습니다', 'success');
        } catch {
            showToast('프로필 저장에 실패했습니다', 'error');
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handlePasswordChange = async (e: FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 8) {
            showToast('새 비밀번호는 8자 이상이어야 합니다', 'error');
            return;
        }
        if (newPassword !== confirmPassword) {
            showToast('새 비밀번호가 일치하지 않습니다', 'error');
            return;
        }
        setIsSavingPassword(true);
        try {
            await apiClient.put('/auth/password', {
                currentPassword,
                newPassword,
            });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            showToast('비밀번호가 변경되었습니다', 'success');
        } catch {
            showToast('비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인해주세요.', 'error');
        } finally {
            setIsSavingPassword(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Current Plan Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                            <Crown className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg font-bold text-slate-900 dark:text-white">{currentPlan}</span>
                                <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full font-medium">무료</span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                월 30건 거래 기록 · 기본 대시보드 · 매매원칙 3개
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/pricing"
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-sm transition-colors shrink-0"
                    >
                        업그레이드
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {/* Usage Bars */}
                <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs text-slate-500 dark:text-slate-400">이달 거래 기록</span>
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums">- / 30건</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: '0%' }} />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs text-slate-500 dark:text-slate-400">매매 원칙</span>
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums">- / 3개</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: '0%' }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Section */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200 dark:border-slate-800">
                    <div className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-slate-900 dark:text-white">프로필 정보</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">기본 계정 정보를 관리합니다</p>
                    </div>
                </div>
                <form onSubmit={handleProfileSave} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">이메일</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type="email" value={user?.email || ''} disabled
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-sm cursor-not-allowed" />
                        </div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">이메일은 변경할 수 없습니다</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">이름</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="이름을 입력하세요"
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors" />
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" disabled={isSavingProfile}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 text-white font-medium rounded-lg text-sm transition-colors">
                            {isSavingProfile ? '저장 중...' : '저장'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Password Section */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200 dark:border-slate-800">
                    <div className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                        <Lock className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-slate-900 dark:text-white">비밀번호 변경</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">계정 비밀번호를 변경합니다</p>
                    </div>
                </div>
                <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">현재 비밀번호</label>
                        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">새 비밀번호</label>
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} placeholder="8자 이상"
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">새 비밀번호 확인</label>
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors" />
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" disabled={isSavingPassword}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 text-white font-medium rounded-lg text-sm transition-colors">
                            {isSavingPassword ? '변경 중...' : '비밀번호 변경'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
