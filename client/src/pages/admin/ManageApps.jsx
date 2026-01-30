import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Check, X, Lock, Unlock, Save } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { adminAPI } from '../../utils/api';
import './Admin.css';

const appNames = {
    wayback: 'WayBack',
    wayfit: 'WayFit',
    waymuscle: 'WayMuscle',
    waybrain: 'WayBrain',
    wayview: 'WayView',
    waysound: 'WaySound',
    waylog: 'WayLog',
    wayspot: 'WaySpot',
    wayrest: 'WayRest',
    waystory: 'WayStory'
};

function ManageApps() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { isAdmin, loading: authLoading } = useAuth();
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!authLoading && !isAdmin()) {
            navigate('/admin/login');
        }
    }, [authLoading, isAdmin, navigate]);

    useEffect(() => {
        fetchApps();
    }, []);

    const fetchApps = async () => {
        try {
            const response = await adminAPI.getApps();
            setApps(response.data.apps);
        } catch (error) {
            console.error('Failed to fetch apps:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleApp = (key) => {
        setApps(apps.map(app =>
            app.key === key ? { ...app, released: !app.released } : app
        ));
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage('');

        try {
            const releasedApps = apps.filter(app => app.released).map(app => app.key);
            await adminAPI.updateApps(releasedApps);
            setMessage(t('admin.apps.saved') || 'Changes saved successfully!');
        } catch (error) {
            console.error('Failed to save:', error);
            setMessage(t('admin.apps.error') || 'Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    if (authLoading || loading) {
        return <div className="admin-loading">{t('common.loading')}</div>;
    }

    return (
        <div className="admin-page">
            <div className="container">
                <div className="admin-header">
                    <h1>{t('admin.apps.title') || 'Manage Apps'}</h1>
                    <p>{t('admin.apps.subtitle') || 'Control which apps are visible to users'}</p>
                </div>

                {message && (
                    <div className={`admin-message ${message.includes('Failed') ? 'error' : 'success'}`}>
                        {message}
                    </div>
                )}

                <div className="admin-card">
                    <div className="apps-management-list">
                        {apps.map(app => (
                            <div key={app.key} className={`app-management-item ${app.released ? 'released' : 'locked'}`}>
                                <div className="app-management-info">
                                    <span className="app-management-name">{appNames[app.key]}</span>
                                    <span className={`app-management-status ${app.released ? 'status-released' : 'status-locked'}`}>
                                        {app.released ? (
                                            <><Unlock size={14} /> {t('admin.apps.released') || 'Released'}</>
                                        ) : (
                                            <><Lock size={14} /> {t('admin.apps.hidden') || 'Hidden'}</>
                                        )}
                                    </span>
                                </div>
                                <button
                                    className={`btn ${app.released ? 'btn-secondary' : 'btn-primary'}`}
                                    onClick={() => toggleApp(app.key)}
                                >
                                    {app.released ? (
                                        <><X size={16} /> {t('admin.apps.hide') || 'Hide'}</>
                                    ) : (
                                        <><Check size={16} /> {t('admin.apps.release') || 'Release'}</>
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="admin-actions">
                        <button
                            className="btn btn-primary btn-lg"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            <Save size={18} />
                            {saving ? (t('common.saving') || 'Saving...') : (t('common.save') || 'Save Changes')}
                        </button>
                    </div>
                </div>

                <div className="admin-notice">
                    <p><strong>{t('admin.apps.notice') || 'Note'}:</strong> {t('admin.apps.noticeText') || 'Hidden apps will only show their name and "Coming Soon" badge. App details, descriptions, and features will be hidden to protect your ideas.'}</p>
                </div>
            </div>
        </div>
    );
}

export default ManageApps;
