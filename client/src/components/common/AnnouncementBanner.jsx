import React, { useState, useEffect } from 'react';
import { X, Megaphone, Sparkles, RefreshCw } from 'lucide-react';
import { announcementsAPI } from '../../utils/api';
import './AnnouncementBanner.css';

function AnnouncementBanner() {
    const [announcement, setAnnouncement] = useState(null);
    const [visible, setVisible] = useState(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLatestAnnouncement();
    }, []);

    const fetchLatestAnnouncement = async () => {
        try {
            setLoading(true);
            const response = await announcementsAPI.getAll(1, 1);
            const announcements = response.data.announcements;

            if (announcements && announcements.length > 0) {
                const latest = announcements[0];
                // Check if user has dismissed this announcement
                const dismissedIds = JSON.parse(localStorage.getItem('dismissedAnnouncements') || '[]');
                if (!dismissedIds.includes(latest.id)) {
                    setAnnouncement(latest);
                }
            }
        } catch (error) {
            console.error('Failed to fetch announcements:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDismiss = () => {
        if (announcement) {
            const dismissedIds = JSON.parse(localStorage.getItem('dismissedAnnouncements') || '[]');
            dismissedIds.push(announcement.id);
            localStorage.setItem('dismissedAnnouncements', JSON.stringify(dismissedIds));
        }
        setVisible(false);
    };

    const getIcon = (type) => {
        switch (type) {
            case 'new_app':
                return <Sparkles size={16} />;
            case 'update':
                return <RefreshCw size={16} />;
            default:
                return <Megaphone size={16} />;
        }
    };

    const getTypeClass = (type) => {
        switch (type) {
            case 'new_app':
                return 'new-app';
            case 'update':
                return 'update';
            default:
                return 'announcement';
        }
    };

    if (loading || !announcement || !visible) {
        return null;
    }

    return (
        <div className={`announcement-banner ${getTypeClass(announcement.type)}`}>
            <div className="announcement-content">
                <span className="announcement-icon">
                    {getIcon(announcement.type)}
                </span>
                <span className="announcement-text">
                    <strong>{announcement.title}</strong>
                    {announcement.content && (
                        <span className="announcement-detail"> - {announcement.content.substring(0, 100)}{announcement.content.length > 100 ? '...' : ''}</span>
                    )}
                </span>
            </div>
            <button
                className="announcement-close"
                onClick={handleDismiss}
                aria-label="Close announcement"
            >
                <X size={16} />
            </button>
        </div>
    );
}

export default AnnouncementBanner;
