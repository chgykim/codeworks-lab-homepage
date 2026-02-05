import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, Eye, EyeOff, UserPlus, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { authAPI } from '../../utils/api';
import { isValidEmail } from '../../utils/sanitize';
import './Auth.css';

function Register() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { register } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [emailChecking, setEmailChecking] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const checkEmailAvailability = async () => {
        if (!formData.email || !isValidEmail(formData.email)) return;

        setEmailChecking(true);
        try {
            const response = await authAPI.checkEmail(formData.email);
            if (!response.data.available) {
                setErrors((prev) => ({ ...prev, email: t('auth.emailTaken') }));
            }
        } catch (error) {
            console.error('Email check failed:', error);
        } finally {
            setEmailChecking(false);
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

        if (!formData.email.trim()) {
            newErrors.email = t('common.required');
        } else if (!isValidEmail(formData.email)) {
            newErrors.email = t('auth.invalidEmail');
        }

        const passwordCheck = validatePassword(formData.password);
        if (!formData.password) {
            newErrors.password = t('common.required');
        } else if (!passwordCheck.hasMinLength) {
            newErrors.password = t('auth.passwordMinLength');
        } else if (!passwordCheck.hasLowercase || !passwordCheck.hasUppercase || !passwordCheck.hasNumber) {
            newErrors.password = t('auth.passwordRequirements');
        }

        if (formData.password !== formData.confirmPassword) {
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
            await register(formData.email, formData.password, formData.name || null);
            navigate('/mypage');
        } catch (error) {
            const errorMsg = error.response?.data?.error || t('auth.registerFailed');
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    const passwordCheck = validatePassword(formData.password);

    return (
        <div className="auth-page page">
            <div className="container">
                <div className="auth-container">
                    <div className="auth-card card">
                        <div className="auth-header">
                            <UserPlus size={40} className="auth-icon" />
                            <h1>{t('auth.register')}</h1>
                            <p>{t('auth.registerSubtitle')}</p>
                        </div>

                        {message && (
                            <div className={`alert alert-${message.type}`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group">
                                <label className="form-label">
                                    <User size={16} />
                                    {t('auth.name')}
                                    <span className="optional">({t('common.optional')})</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder={t('auth.namePlaceholder')}
                                    autoComplete="name"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <Mail size={16} />
                                    {t('auth.email')}
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    onBlur={checkEmailAvailability}
                                    className={`form-input ${errors.email ? 'error' : ''}`}
                                    placeholder={t('auth.emailPlaceholder')}
                                    autoComplete="email"
                                />
                                {emailChecking && (
                                    <span className="form-hint">{t('common.loading')}</span>
                                )}
                                {errors.email && <span className="form-error">{errors.email}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <Lock size={16} />
                                    {t('auth.password')}
                                </label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`form-input ${errors.password ? 'error' : ''}`}
                                        placeholder={t('auth.passwordPlaceholder')}
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.password && <span className="form-error">{errors.password}</span>}

                                {formData.password && (
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
                                        placeholder={t('auth.confirmPasswordPlaceholder')}
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
                                className="btn btn-primary btn-full"
                                disabled={loading}
                            >
                                {loading ? t('common.loading') : t('auth.register')}
                            </button>
                        </form>

                        <div className="auth-footer">
                            <p>
                                {t('auth.hasAccount')}{' '}
                                <Link to="/login">{t('auth.login')}</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
