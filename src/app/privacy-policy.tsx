import React from 'react'

export default function PrivacyPolicyPage() {
    return (
        <div className="privacy-policy">
            <h1>Privacy Policy</h1>
            <p><strong>Last Updated:</strong> October 27, 2023</p>

            <h2>1. Introduction</h2>
            <p>
                Welcome to MindTab! We are committed to protecting your privacy and ensuring that your personal information is handled in a safe and responsible manner. This Privacy Policy outlines how we collect, use, and safeguard your information when you use our Chrome extension.
            </p>

            <h2>2. Information We Collect</h2>
            <p>
                When you use MindTab, we may collect the following types of information:
            </p>
            <ul>
                <li><strong>Personal Information:</strong> If you choose to sign in to MindTab, we collect information such as your email address and any other information you provide during the sign-in process.</li>
                <li><strong>Usage Data:</strong> We collect information about how you interact with MindTab, including your goals, journal entries, and preferences.</li>
                <li><strong>Device Information:</strong> Information about the devices you use to access MindTab, including device type, operating system, and browser type.</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>
                We use the information we collect to provide, maintain, and improve MindTab, including:
            </p>
            <ul>
                <li>Enabling user authentication and account management.</li>
                <li>Synchronizing your data across multiple devices when you enable sync.</li>
                <li>Personalizing your experience and improving the functionality of our extension.</li>
                <li>Communicating with you, including responding to your inquiries and providing updates.</li>
            </ul>

            <h2>4. Data Synchronization</h2>
            <p>
                MindTab offers a synchronization feature that allows your data to be synced across multiple devices. When you enable sync, your goals and journal entries are stored securely and updated in real-time on all devices where you are signed in.
            </p>
            <p>
                You can choose to enable or disable synchronization at any time through the extension settings.
            </p>

            <h2>5. Data Security</h2>
            <p>
                We implement industry-standard security measures to protect your information from unauthorized access, disclosure, alteration, and destruction. However, no method of transmission over the Internet or electronic storage is completely secure, and we cannot guarantee absolute security.
            </p>

            <h2>6. Third-Party Services</h2>
            <p>
                MindTab does not share your personal information with third parties except as necessary to provide our services or as required by law. We may use third-party services to help us operate and improve MindTab, and these service providers are bound by confidentiality agreements.
            </p>

            <h2>7. Your Rights</h2>
            <p>
                You have the right to access, update, or delete the personal information we have collected about you. You can manage your information and privacy settings within the MindTab extension or by contacting us directly.
            </p>

            <h2>8. Changes to This Privacy Policy</h2>
            <p>
                We may update this Privacy Policy from time to time. Any changes will be posted on this page, and the "Last Updated" date will be revised accordingly. We encourage you to review this Privacy Policy periodically to stay informed about our data practices.
            </p>

            <h2>9. Contact Us</h2>
            <p>
                If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at <a href="mailto:support@mindtab.com">support@mindtab.com</a>.
            </p>
        </div>
    );
}