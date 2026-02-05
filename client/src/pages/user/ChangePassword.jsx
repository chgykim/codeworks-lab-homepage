import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Lock, Eye, EyeOff, Check } from 'lucide-react';
import { userAPI } from '../../utils/api';
import './User.css';

function ChangePassword() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validatePassword = (password) => {
        const hasLowercase = /[a-z]/.test(password);
        const hasUppercase = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasMinLength = password.length >= 8;

        return { hasLowercase, hasUppercase, hasNumber, hasMinLength };
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.currentPassword) {
            newErrors.currentPassword = t('common.required');
        }

        const passwordCheck = validatePassword(formData.newPassword);
        if (!formData.newPassword) {
            newErrors.newPassword = t('common.required');
        } else if (!passwordCheck.hasMinLength) {
            newErrors.newPassword = t('auth.passwordMinLength');
        } else if (!passwordCheck.hasLowercase || !passwordCheck.hasUppercase || !passwordCheck.hasNumber) {
            newErrors.newPassword = t('auth.passwordRequirements');
        }

        if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = t('auth.passwordMismatch');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);

        if (!validate()) return;

        setLoading(true);

        try {
            await userAPI.changePassword(formData.currentPassword, formData.newPassword);
            setMessage({ type: 'success', text: t('mypage.passwordChanged') });
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });

            setTimeout(() => {
                navigate('/mypage');
            }, 2000);
        } catch (error) {
            const errorMsg = error.response?.data?.error || t('common.error');
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    const passwordCheck = validatePassword(formData.newPassword);

    return (
        <div className="user-page page">
            <div className="container">
                <div className="page-header">
                    <Link to="/mypage" className="back-link">
                        <ArrowLeft size={20} />
                        {t('mypage.title')}
                    </Link>
                    <h1>{t('mypage.changePassword')}</h1>
                </div>

                <div className="user-content">
                    <div className="user-card card">
                        {message && (
                            <div className={`alert alert-${message.type}`}>
                                {message.type === 'success' && <Check size={18} />}
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="user-form">
                            <div className="form-group">
                                <label className="form-label">
                                    <Lock size={16} />
                                    {t('mypage.currentPassword')}
                                </label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showCurrentPassword ? 'text' : 'password'}
                                        name="currentPassword"
                                        value={formData.currentPassword}
                                        onChange={handleChange}
                                        className={`form-input ${errors.currentPassword ? 'error' : ''}`}
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    >
                                        {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.currentPassword && (
                                    <span className="form-error">{errors.currentPassword}</span>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <Lock size={16} />
                                    {t('mypage.newPassword')}
                                </label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        className={`form-input ${errors.newPassword ? 'error' : ''}`}
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                    >
                                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.newPassword && (
                                    <span className="form-error">{errors.newPassword}</span>
                                )}

                                {formData.newPassword && (
                                    <div className="password-strength">
                                        <div className={`strength-item ${passwordCheck.hasMinLength ? 'valid' : ''}`}>
                                            {t('auth.passwordMin8')}
                                        </div>
                                        <div className={`strength-item ${passwordCheck.hasLowercase ? 'valid' : ''}`}>
                                            {t('auth.passwordLowercase')}
                                        </div>
                                        <div className={`strength-item ${passwordCheck.hasUppercase ? 'valid' : ''}`}>
                                            {t('auth.passwordUppercase')}
                                        </div>
                                        <div className={`strength-item ${passwordCheck.hasNumber ? 'valid' : ''}`}>
                                            {t('auth.passwordNumber')}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <Lock size={16} />
                                    {t('auth.confirmPassword')}
                                </label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <span className="form-error">{errors.confirmPassword}</span>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? t('common.loading') : t('mypage.changePassword')}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChangePassword;
