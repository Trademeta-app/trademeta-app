import React, { useState, useEffect } from 'react';
import { User } from '../../types';
// --- BU SATIR DÜZELTİLDİ ---
import { auth } from '../../src/firebase'; 
// ------------------------------
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import Card from '../shared/Card';
import { UserIcon } from '../shared/Icons';

interface UserProfileProps {
    user: User;
    onUpdateUser: (updatedUser: Partial<User>) => void;
}

interface FormInputProps {
    label: string;
    id: keyof User | string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    type?: string;
    disabled?: boolean;
}

const ProfileInput: React.FC<FormInputProps> = ({ label, id, value, onChange, type = 'text', disabled = false }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-muted mb-1">{label}</label>
        <input
            type={type}
            id={id}
            name={id}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className="w-full bg-background border border-border-color rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary transition-all disabled:opacity-50"
        />
    </div>
);

const ProfileSelect: React.FC<FormInputProps & { children: React.ReactNode }> = ({ label, id, value, onChange, disabled = false, children }) => (
     <div>
        <label htmlFor={id} className="block text-sm font-medium text-muted mb-1">{label}</label>
        <select
            id={id}
            name={id}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className="w-full bg-background border border-border-color rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary transition-all disabled:opacity-50"
        >
            {children}
        </select>
    </div>
);

const ProfileTextarea: React.FC<FormInputProps> = ({ label, id, value, onChange, disabled = false }) => (
     <div>
        <label htmlFor={id} className="block text-sm font-medium text-muted mb-1">{label}</label>
        <textarea
            id={id}
            name={id}
            value={value}
            onChange={onChange}
            disabled={disabled}
            rows={3}
            className="w-full bg-background border border-border-color rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary transition-all disabled:opacity-50 resize-none"
        />
    </div>
);


const UserProfile: React.FC<UserProfileProps> = ({ user, onUpdateUser }) => {
    const [isEditing, setIsEditing] = useState(false);
    
    const [formData, setFormData] = useState({
        name: user.name || '',
        email: user.email || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || '',
        address: user.address || ''
    });

    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        setFormData({
            name: user.name || '',
            email: user.email || '',
            dateOfBirth: user.dateOfBirth || '',
            gender: user.gender || '',
            address: user.address || ''
        });
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setPasswordData(prev => ({ ...prev, [id]: value }));
    }

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleProfileSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            onUpdateUser(formData);
            showNotification('success', 'Profile updated successfully!');
            setIsEditing(false);
        } catch (error) {
            showNotification('error', 'Failed to update profile.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handlePasswordSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showNotification('error', 'New passwords do not match.');
            return;
        }
        if (passwordData.newPassword.length < 6) {
             showNotification('error', 'Password must be at least 6 characters long.');
            return;
        }

        setIsLoading(true);
        const currentUser = auth.currentUser;
        if (!currentUser || !currentUser.email) {
            showNotification('error', 'User not found. Please log in again.');
            setIsLoading(false);
            return;
        }

        try {
            const credential = EmailAuthProvider.credential(currentUser.email, passwordData.currentPassword);
            await reauthenticateWithCredential(currentUser, credential);
            await updatePassword(currentUser, passwordData.newPassword);
            
            showNotification('success', 'Password changed successfully!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            if (error.code === 'auth/wrong-password') {
                showNotification('error', 'Incorrect current password.');
            } else {
                showNotification('error', 'Failed to change password. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    }

    const handleCancelEdit = () => {
        setFormData({
            name: user.name || '',
            email: user.email || '',
            dateOfBirth: user.dateOfBirth || '',
            gender: user.gender || '',
            address: user.address || ''
        });
        setIsEditing(false);
    }

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <UserIcon className="w-10 h-10 text-primary"/>
                <div>
                    <h1 className="text-3xl font-bold text-white">My Profile</h1>
                    <p className="text-muted">Manage your personal information and security settings.</p>
                </div>
            </div>

            {notification && (
                <div className={`p-3 rounded-md text-sm text-center ${notification.type === 'success' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                    {notification.message}
                </div>
            )}

            <Card>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Profile Details</h2>
                    {!isEditing && (
                        <button onClick={() => setIsEditing(true)} className="bg-primary text-background font-bold py-2 px-4 rounded-md text-sm hover:bg-primary-focus transition-colors">
                            Edit Profile
                        </button>
                    )}
                </div>
                <form onSubmit={handleProfileSave} className="space-y-4">
                    <ProfileInput label="Full Name" id="name" value={formData.name} onChange={handleInputChange} disabled={!isEditing || isLoading} />
                    <ProfileInput label="Email Address" id="email" value={formData.email} type="email" disabled={true} onChange={() => {}} />
                    <ProfileInput label="Date of Birth" id="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} type="date" disabled={!isEditing || isLoading} />
                    <ProfileSelect label="Gender" id="gender" value={formData.gender} onChange={handleInputChange} disabled={!isEditing || isLoading}>
                        <option value="" disabled>Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer_not_to_say">Prefer not to say</option>
                    </ProfileSelect>
                    <ProfileTextarea label="Address" id="address" value={formData.address} onChange={handleInputChange} disabled={!isEditing || isLoading} />

                    {isEditing && (
                        <div className="flex justify-end gap-3 pt-4">
                             <button type="button" onClick={handleCancelEdit} disabled={isLoading} className="bg-surface border border-border-color text-white font-bold py-2 px-4 rounded-md text-sm hover:bg-border-color transition-colors">
                                Cancel
                            </button>
                             <button type="submit" disabled={isLoading} className="bg-success text-white font-bold py-2 px-4 rounded-md text-sm hover:bg-green-600 transition-colors disabled:opacity-50">
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    )}
                </form>
            </Card>

            <Card>
                <h2 className="text-xl font-bold text-white mb-6">Security</h2>
                 <form onSubmit={handlePasswordSave} className="space-y-4">
                    <ProfileInput label="Current Password" id="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} type="password" disabled={isLoading} />
                    <ProfileInput label="New Password" id="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} type="password" disabled={isLoading} />
                    <ProfileInput label="Confirm New Password" id="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} type="password" disabled={isLoading} />
                     <div className="flex justify-end pt-4">
                         <button type="submit" disabled={isLoading} className="bg-primary text-background font-bold py-2 px-4 rounded-md text-sm hover:bg-primary-focus transition-colors disabled:opacity-50">
                            {isLoading ? 'Updating...' : 'Change Password'}
                        </button>
                    </div>
                 </form>
            </Card>
        </div>
    );
};

export default UserProfile;