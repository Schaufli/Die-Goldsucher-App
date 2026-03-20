import React, { useState, useEffect } from 'react';
import { X, LogIn, LogOut, Mail, Lock, UserPlus, User as UserIcon, CheckCircle, Camera, Trash2, Save, Edit2 } from 'lucide-react';
import { AuthService, UserProfile } from '../../services/authService';
import { Button } from '../UI/Button';
import { User } from 'firebase/auth';
import { storage } from '../../services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface AuthDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

type AuthMode = 'login' | 'register' | 'forgot' | 'verify';

export const AuthDrawer: React.FC<AuthDrawerProps> = ({ isOpen, onClose, user }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [verificationEmail, setVerificationEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Profile states
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Reset state when opening/closing
  useEffect(() => {
      if (isOpen) {
          setError(null);
          setSuccessMsg(null);
          setEditMode(false);
          setPhotoFile(null);
          if (!user) {
            setMode('login');
            setFirstName('');
            setEmail('');
            setVerificationEmail('');
            setPassword('');
            setConfirmPassword('');
          }
      }
  }, [isOpen, user]);

  // Fetch profile when user changes
  useEffect(() => {
    const fetchProfile = async () => {
        if (user) {
            const p = await AuthService.getUserProfile(user.uid);
            setProfile(p);
            if (p) {
                setEditedName(p.name);
                if (p.photoFileName) {
                    try {
                        const storageRef = ref(storage, `profiles/${p.photoFileName}`);
                        const url = await getDownloadURL(storageRef);
                        setPhotoPreview(url);
                    } catch (e) {
                        console.error("Error loading profile photo", e);
                        setPhotoPreview(user.photoURL);
                    }
                } else {
                    setPhotoPreview(user.photoURL);
                }
            }
        } else {
            setProfile(null);
            setPhotoPreview(null);
        }
    };
    fetchProfile();
  }, [user]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      // Redirects to Google — page will navigate away, no onClose needed
      await AuthService.loginWithGoogle();
    } catch (err: any) {
      console.error("Google Login Error:", err);
      if (err.code === 'auth/operation-not-allowed') {
          setError("Google Login ist in Firebase nicht aktiviert. Bitte aktiviere 'Google' unter 'Authentication' -> 'Sign-in method'.");
      } else {
          setError(`Google Anmeldung fehlgeschlagen: ${err.message || "Unbekannter Fehler"}`);
      }
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    if (!firstName.trim()) {
        setError("Bitte gib deinen Vornamen ein, bevor du dich mit Google registrierst.");
        return;
    }
    setLoading(true);
    setError(null);
    try {
      // Pass name so it's applied after the redirect returns
      await AuthService.loginWithGoogle(firstName.trim());
    } catch (err: any) {
      console.error("Google Register Error:", err);
      if (err.code === 'auth/operation-not-allowed') {
          setError("Google Login ist in Firebase nicht aktiviert. Bitte aktiviere 'Google' unter 'Authentication' -> 'Sign-in method'.");
      } else {
          setError(`Google Registrierung fehlgeschlagen: ${err.message || "Unbekannter Fehler"}`);
      }
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
      setSuccessMsg(null);

      try {
          if (mode === 'login') {
              const userCredential = await AuthService.loginWithEmail(email, password);
              if (!userCredential.user.emailVerified) {
                  setVerificationEmail(userCredential.user.email || email);
                  await AuthService.logout();
                  setMode('verify');
                  return;
              }
              onClose();
          } else if (mode === 'register') {
              if (password !== confirmPassword) {
                  throw new Error("Die Passwörter stimmen nicht überein.");
              }
              await AuthService.registerWithEmail(email, password, firstName);
              setVerificationEmail(email);
              setMode('verify');
          } else if (mode === 'forgot') {
              await AuthService.resetPassword(email);
              setSuccessMsg("Link zum Zurücksetzen des Passworts wurde gesendet.");
              setMode('login');
          }
      } catch (err: any) {
          console.error(err);
          switch (err.code) {
              case 'auth/user-not-found':
              case 'auth/invalid-credential':
              case 'auth/wrong-password':
                  setError('E-Mail oder Passwort ist falsch.');
                  break;
              case 'auth/email-already-in-use':
                  setError('Diese E-Mail-Adresse wird bereits verwendet.');
                  break;
              case 'auth/weak-password':
                  setError('Das Passwort muss mindestens 6 Zeichen lang sein.');
                  break;
              case 'auth/invalid-email':
                  setError('Ungültige E-Mail-Adresse.');
                  break;
              default:
                  setError(err.message || 'Ein Fehler ist aufgetreten.');
          }
      } finally {
          setLoading(false);
      }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await AuthService.logout();
      onClose();
    } catch (err) {
      setError("Abmeldung fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
        let photoFileName = profile?.photoFileName || '';
        
        if (photoFile) {
            const fileExt = photoFile.name.split('.').pop();
            photoFileName = `profile_${user.uid}_${Date.now()}.${fileExt}`;
            const storageRef = ref(storage, `profiles/${photoFileName}`);
            await uploadBytes(storageRef, photoFile);
            const photoUrl = await getDownloadURL(storageRef);
            await AuthService.updateUserProfile(user, editedName);
            // In a real app we might update the auth photoURL too
        } else {
            await AuthService.updateUserProfile(user, editedName);
        }

        await AuthService.updateUserProfileInFirestore(user.uid, {
            name: editedName,
            photoFileName: photoFileName
        });

        const updatedProfile = await AuthService.getUserProfile(user.uid);
        setProfile(updatedProfile);
        setEditMode(false);
        setSuccessMsg("Profil erfolgreich aktualisiert.");
    } catch (err: any) {
        setError("Profil-Update fehlgeschlagen: " + err.message);
    } finally {
        setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Bist du sicher? Dein Konto und alle Daten werden unwiderruflich gelöscht.")) return;
    
    setLoading(true);
    try {
        await AuthService.deleteUserAccount();
        onClose();
    } catch (err: any) {
        setError("Löschen fehlgeschlagen. Möglicherweise musst du dich erneut anmelden, um diese Aktion auszuführen.");
    } finally {
        setLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto transition-opacity" onClick={onClose} />
      
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl transform transition-transform animate-slide-up pointer-events-auto max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-brand-text">
            {user ? 'Dein Profil' : (
                mode === 'login' ? 'Anmelden' : 
                mode === 'register' ? 'Registrieren' : 
                mode === 'verify' ? 'E-Mail bestätigen' :
                'Passwort vergessen'
            )}
          </h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm animate-fade-in">
                {error}
            </div>
        )}
        {successMsg && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm animate-fade-in">
                {successMsg}
            </div>
        )}

        <div className="flex flex-col gap-4">
          {user ? (
            <div className="flex flex-col items-center gap-6 py-4">
                <div className="relative group">
                    <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-brand-gold shadow-lg bg-gray-100 flex items-center justify-center">
                        {photoPreview ? (
                            <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-brand-text font-bold text-4xl">
                                {profile?.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    {editMode && (
                        <label className="absolute bottom-0 right-0 p-2 bg-brand-gold text-brand-text rounded-full shadow-md cursor-pointer hover:bg-yellow-500 transition-colors">
                            <Camera size={18} />
                            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                        </label>
                    )}
                </div>

                <div className="w-full space-y-4">
                    {editMode ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input 
                                    type="text" 
                                    value={editedName}
                                    onChange={(e) => setEditedName(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-gold outline-none"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button variant="primary" onClick={handleUpdateProfile} disabled={loading} className="flex-1">
                                    <Save size={18} className="mr-2" /> Speichern
                                </Button>
                                <Button variant="secondary" onClick={() => {
                                    setEditMode(false);
                                    setEditedName(profile?.name || '');
                                    setPhotoPreview(null);
                                }} disabled={loading}>
                                    Abbrechen
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center space-y-1">
                            <h3 className="text-2xl font-bold text-brand-text">{profile?.name || user.displayName || 'Goldsucher'}</h3>
                            <p className="text-gray-500">{user.email}</p>
                            <button 
                                onClick={() => setEditMode(true)}
                                className="text-brand-gold text-sm font-medium hover:underline flex items-center justify-center mx-auto mt-2"
                            >
                                <Edit2 size={14} className="mr-1" /> Profil bearbeiten
                            </button>
                        </div>
                    )}
                </div>

                <div className="w-full pt-6 border-t border-gray-100 space-y-3">
                    <Button variant="secondary" onClick={handleLogout} disabled={loading} className="w-full py-3">
                        <LogOut size={20} className="mr-2" /> Abmelden
                    </Button>
                    <button 
                        onClick={handleDeleteAccount}
                        disabled={loading}
                        className="w-full py-3 text-red-500 text-sm font-medium hover:bg-red-50 rounded-xl transition-colors flex items-center justify-center"
                    >
                        <Trash2 size={16} className="mr-2" /> Konto löschen
                    </button>
                </div>
            </div>
          ) : mode === 'verify' ? (
            <div className="flex flex-col items-center text-center py-6 gap-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <CheckCircle size={48} />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-900">Fast geschafft!</h3>
                    <p className="text-gray-600">
                        Wir haben dir eine Bestätigungs-E-Mail an <span className="font-semibold text-brand-text">{verificationEmail}</span> gesendet.
                    </p>
                    <p className="text-gray-600 text-sm">
                        Bitte bestätige deine E-Mail-Adresse über den Link in der Nachricht und melde dich anschließend an.
                    </p>
                </div>
                <Button 
                    variant="primary" 
                    onClick={() => setMode('login')} 
                    className="w-full py-3.5 text-lg"
                >
                    <LogIn size={20} className="mr-2 inline" /> Zum Login
                </Button>
            </div>
          ) : (
            <>
              <form onSubmit={handleEmailAuth} className="flex flex-col gap-4">
                  {mode === 'login' && (
                      <>
                          <button 
                              type="button"
                              onClick={handleGoogleLogin} 
                              disabled={loading} 
                              className="w-full py-3 px-4 bg-white border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 shadow-sm active:scale-[0.98]"
                          >
                              <svg className="w-5 h-5" viewBox="0 0 24 24">
                                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                              </svg>
                              Mit Google anmelden
                          </button>
                          <div className="relative my-2">
                              <div className="absolute inset-0 flex items-center">
                                  <div className="w-full border-t border-gray-200"></div>
                              </div>
                              <div className="relative flex justify-center text-sm">
                                  <span className="px-4 bg-white text-gray-500">Oder mit E-Mail</span>
                              </div>
                          </div>
                      </>
                  )}

                  {mode === 'register' && (
                      <>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Vorname</label>
                              <div className="relative">
                                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                  <input 
                                      type="text" 
                                      value={firstName}
                                      onChange={(e) => setFirstName(e.target.value)}
                                      required
                                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all outline-none"
                                      placeholder="Dein Vorname"
                                  />
                              </div>
                          </div>
                          
                          <button 
                              type="button"
                              onClick={handleGoogleRegister} 
                              disabled={loading} 
                              className="w-full py-3 px-4 bg-white border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 shadow-sm active:scale-[0.98] mt-2"
                          >
                              <svg className="w-5 h-5" viewBox="0 0 24 24">
                                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                              </svg>
                              Mit Google registrieren
                          </button>
                          
                          <div className="relative my-2">
                              <div className="absolute inset-0 flex items-center">
                                  <div className="w-full border-t border-gray-200"></div>
                              </div>
                              <div className="relative flex justify-center text-sm">
                                  <span className="px-4 bg-white text-gray-500">Oder mit E-Mail</span>
                              </div>
                          </div>
                      </>
                  )}

                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail Adresse</label>
                      <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                          <input 
                              type="email" 
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all outline-none"
                              placeholder="mail@beispiel.de"
                          />
                      </div>
                  </div>

                  {mode !== 'forgot' && (
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Passwort</label>
                          <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                              <input 
                                  type="password" 
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                  required
                                  minLength={6}
                                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all outline-none"
                                  placeholder="••••••••"
                              />
                          </div>
                      </div>
                  )}

                  {mode === 'register' && (
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Passwort bestätigen</label>
                          <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                              <input 
                                  type="password" 
                                  value={confirmPassword}
                                  onChange={(e) => setConfirmPassword(e.target.value)}
                                  required
                                  minLength={6}
                                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all outline-none"
                                  placeholder="••••••••"
                              />
                          </div>
                      </div>
                  )}

                  {mode === 'login' && (
                      <div className="flex justify-end">
                          <button 
                              type="button" 
                              onClick={() => setMode('forgot')}
                              className="text-sm text-brand-gold hover:text-yellow-700 font-medium"
                          >
                              Passwort vergessen?
                          </button>
                      </div>
                  )}

                  <Button variant="primary" type="submit" disabled={loading || !email || (mode !== 'forgot' && !password)} className="w-full py-3.5 text-lg mt-2">
                      {mode === 'login' ? <><LogIn size={20} className="mr-2 inline" /> Anmelden</> : 
                       mode === 'register' ? <><UserPlus size={20} className="mr-2 inline" /> Registrieren</> : 
                       'Link senden'}
                  </Button>
              </form>

              <div className="mt-4 text-center">
                  {mode === 'login' ? (
                      <p className="text-sm text-gray-600">
                          Noch kein Konto?{' '}
                          <button type="button" onClick={() => setMode('register')} className="text-brand-gold font-bold hover:underline">
                              Jetzt registrieren
                          </button>
                      </p>
                  ) : (
                      <p className="text-sm text-gray-600">
                          {mode === 'register' ? 'Bereits ein Konto?' : 'Zurück zur'} {' '}
                          <button type="button" onClick={() => setMode('login')} className="text-brand-gold font-bold hover:underline">
                              Anmeldung
                          </button>
                      </p>
                  )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
