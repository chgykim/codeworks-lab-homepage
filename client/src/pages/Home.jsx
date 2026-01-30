import React, { useState, useEffect } from 'react';
import { settingsAPI } from '../utils/api';

import Hero from '../components/landing/Hero';
import AppShowcase from '../components/landing/AppShowcase';
import Features from '../components/landing/Features';
import ReviewPreview from '../components/landing/ReviewPreview';
import FAQ from '../components/landing/FAQ';

function Home() {
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await settingsAPI.getPublic();
            setSettings(response.data);
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        }
    };

    return (
        <div className="home-page">
            <Hero settings={settings} />
            <AppShowcase releasedApps={settings?.releasedApps || []} />
            <Features />
            <ReviewPreview />
            <FAQ />
        </div>
    );
}

export default Home;
