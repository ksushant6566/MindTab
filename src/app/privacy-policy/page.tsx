import React from 'react';

export default function PrivacyPolicyPage() {
    return (
        <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg my-8 font-sans text-gray-800">
            <h1 className="text-4xl font-bold text-center text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-center text-sm text-gray-500 mb-8">
                <strong>Last Updated:</strong> 18 September 2024
            </p>

            <section className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-gray-200 pb-2 mb-3">1. Introduction</h2>
                <p className="text-base leading-relaxed">
                    Welcome to MindTab! We are committed to protecting your privacy and ensuring that your personal information is handled in a safe and responsible manner. This Privacy Policy outlines how we collect, use, and safeguard your information when you use our Chrome extension.
                </p>
            </section>

            <section className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-gray-200 pb-2 mb-3">2. Information We Collect</h2>
                <p className="text-base leading-relaxed mb-3">
                    When you use MindTab, we may collect the following types of information:
                </p>
                <ul className="list-disc list-inside space-y-2">
                    <li>
                        <strong>Personal Information:</strong> If you choose to sign in to MindTab, we collect information such as your email address and any other information you provide during the sign-in process.
                    </li>
                    <li>
                        <strong>Usage Data:</strong> We collect information about how you interact with MindTab, including your goals, journal entries, and preferences.
                    </li>
                    <li>
                        <strong>Device Information:</strong> Information about the devices you use to access MindTab, including device type, operating system, and browser type.
                    </li>
                </ul>
            </section>

            <section className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-gray-200 pb-2 mb-3">3. How We Use Your Information</h2>
                <p className="text-base leading-relaxed mb-3">
                    We use the information we collect to provide, maintain, and improve MindTab, including:
                </p>
                <ul className="list-disc list-inside space-y-2">
                    <li>Enabling user authentication and account management.</li>
                    <li>Synchronizing your data across multiple devices when you enable sync.</li>
                    <li>Personalizing your experience and improving the functionality of our extension.</li>
                    <li>Communicating with you, including responding to your inquiries and providing updates.</li>
                </ul>
            </section>

            <section className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-gray-200 pb-2 mb-3">4. Data Synchronization</h2>
                <p className="text-base leading-relaxed mb-3">
                    MindTab offers a synchronization feature that allows your data to be synced across multiple devices. When you enable sync, your goals and journal entries are stored securely and updated in real-time on all devices where you are signed in.
                </p>
                <p className="text-base leading-relaxed">
                    You can choose to enable or disable synchronization at any time through the extension settings.
                </p>
            </section>

            <section className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-gray-200 pb-2 mb-3">5. Data Security</h2>
                <p className="text-base leading-relaxed">
                    We implement industry-standard security measures to protect your information from unauthorized access, disclosure, alteration, and destruction. However, no method of transmission over the Internet or electronic storage is completely secure, and we cannot guarantee absolute security.
                </p>
            </section>

            <section className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-gray-200 pb-2 mb-3">6. Third-Party Services</h2>
                <p className="text-base leading-relaxed">
                    MindTab does not share your personal information with third parties except as necessary to provide our services or as required by law. We may use third-party services to help us operate and improve MindTab, and these service providers are bound by confidentiality agreements.
                </p>
            </section>

            <section className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-gray-200 pb-2 mb-3">7. Your Rights</h2>
                <p className="text-base leading-relaxed">
                    You have the right to access, update, or delete the personal information we have collected about you. You can manage your information and privacy settings within the MindTab extension or by contacting us directly.
                </p>
            </section>

            <section className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-gray-200 pb-2 mb-3">8. Changes to This Privacy Policy</h2>
                <p className="text-base leading-relaxed">
                    We may update this Privacy Policy from time to time. Any changes will be posted on this page, and the "Last Updated" date will be revised accordingly. We encourage you to review this Privacy Policy periodically to stay informed about our data practices.
                </p>
            </section>

            <section className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-gray-200 pb-2 mb-3">9. Contact Us</h2>
                <p className="text-base leading-relaxed">
                    If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at{' '}
                    <a href="mailto:support@mindtab.com" className="text-blue-500 hover:underline">
                        support@mindtab.com
                    </a>.
                </p>
            </section>
        </div>
    );
}