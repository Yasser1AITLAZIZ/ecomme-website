"""Translation messages for error handling."""
from typing import Dict

# Translation dictionary for error messages
MESSAGES: Dict[str, Dict[str, str]] = {
    "en": {
        # Registration errors
        "email_already_registered": "Email already registered. Please sign in instead.",
        "failed_to_create_user": "Failed to create user account",
        "registration_failed": "Registration failed",
        
        # Login errors
        "invalid_credentials": "Invalid email or password",
        "authentication_failed": "Authentication failed",
        "login_failed": "Login failed",
        
        # Email verification
        "email_verification_required": "Please check your email to verify your account before logging in.",
        "invalid_verification_token": "Invalid or expired verification token",
        "invalid_verification_token_request_new": "Invalid or expired verification token. Please request a new verification email.",
        "failed_to_confirm_email": "Failed to confirm email",
        "email_confirmed_sign_in": "Email confirmed but could not create session. Please sign in.",
        "email_confirmed_sign_in_password": "Email confirmed. Please sign in with your email and password.",
        "failed_to_get_user_info": "Failed to get user information",
        "failed_to_verify_email": "Failed to verify email",
        "failed_to_create_session": "Failed to create session after email verification",
        "email_verified_success": "Email verified successfully. You are now logged in.",
        
        # Password reset
        "password_reset_sent": "If an account with that email exists, a password reset link has been sent.",
        "invalid_reset_token": "Invalid reset token",
        "reset_token_expired": "Reset token has expired. Please request a new password reset link.",
        "failed_to_reset_password": "Failed to reset password",
        "password_reset_success": "Password has been reset successfully. You can now log in with your new password.",
        "invalid_or_expired_reset_token": "Invalid or expired reset token. Please request a new password reset link.",
        
        # Profile update
        "failed_to_update_profile": "Failed to update profile",
        "failed_to_update_email": "Failed to update email",
        "profile_updated_success": "Profile updated successfully.",
        "profile_updated_email_sent": "Profile updated successfully. A confirmation email has been sent to {email}. Please check your email to confirm the new address.",
        "profile_updated_email_should_sent": "Profile updated successfully. A confirmation email should have been sent to {email}. Please check your email to confirm the new address.",
        "user_profile_not_found": "User profile not found",
        "failed_to_retrieve_profile": "Failed to retrieve updated profile",
    },
    "fr": {
        # Registration errors
        "email_already_registered": "Cette adresse e-mail est déjà enregistrée. Veuillez vous connecter à la place.",
        "failed_to_create_user": "Échec de la création du compte utilisateur",
        "registration_failed": "Échec de l'inscription",
        
        # Login errors
        "invalid_credentials": "Adresse e-mail ou mot de passe invalide",
        "authentication_failed": "Échec de l'authentification",
        "login_failed": "Échec de la connexion",
        
        # Email verification
        "email_verification_required": "Veuillez vérifier votre e-mail pour vérifier votre compte avant de vous connecter.",
        "invalid_verification_token": "Jeton de vérification invalide ou expiré",
        "invalid_verification_token_request_new": "Jeton de vérification invalide ou expiré. Veuillez demander un nouvel e-mail de vérification.",
        "failed_to_confirm_email": "Échec de la confirmation de l'e-mail",
        "email_confirmed_sign_in": "E-mail confirmé mais impossible de créer une session. Veuillez vous connecter.",
        "email_confirmed_sign_in_password": "E-mail confirmé. Veuillez vous connecter avec votre adresse e-mail et votre mot de passe.",
        "failed_to_get_user_info": "Échec de la récupération des informations utilisateur",
        "failed_to_verify_email": "Échec de la vérification de l'e-mail",
        "failed_to_create_session": "Échec de la création de la session après la vérification de l'e-mail",
        "email_verified_success": "E-mail vérifié avec succès. Vous êtes maintenant connecté.",
        
        # Password reset
        "password_reset_sent": "Si un compte avec cette adresse e-mail existe, un lien de réinitialisation du mot de passe a été envoyé.",
        "invalid_reset_token": "Jeton de réinitialisation invalide",
        "reset_token_expired": "Le jeton de réinitialisation a expiré. Veuillez demander un nouveau lien de réinitialisation du mot de passe.",
        "failed_to_reset_password": "Échec de la réinitialisation du mot de passe",
        "password_reset_success": "Le mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.",
        "invalid_or_expired_reset_token": "Jeton de réinitialisation invalide ou expiré. Veuillez demander un nouveau lien de réinitialisation du mot de passe.",
        
        # Profile update
        "failed_to_update_profile": "Échec de la mise à jour du profil",
        "failed_to_update_email": "Échec de la mise à jour de l'e-mail",
        "profile_updated_success": "Profil mis à jour avec succès.",
        "profile_updated_email_sent": "Profil mis à jour avec succès. Un e-mail de confirmation a été envoyé à {email}. Veuillez vérifier votre e-mail pour confirmer la nouvelle adresse.",
        "profile_updated_email_should_sent": "Profil mis à jour avec succès. Un e-mail de confirmation devrait avoir été envoyé à {email}. Veuillez vérifier votre e-mail pour confirmer la nouvelle adresse.",
        "user_profile_not_found": "Profil utilisateur introuvable",
        "failed_to_retrieve_profile": "Échec de la récupération du profil mis à jour",
    },
    "ar": {
        # Registration errors
        "email_already_registered": "البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول بدلاً من ذلك.",
        "failed_to_create_user": "فشل في إنشاء حساب المستخدم",
        "registration_failed": "فشل التسجيل",
        
        # Login errors
        "invalid_credentials": "البريد الإلكتروني أو كلمة المرور غير صحيحة",
        "authentication_failed": "فشل المصادقة",
        "login_failed": "فشل تسجيل الدخول",
        
        # Email verification
        "email_verification_required": "يرجى التحقق من بريدك الإلكتروني للتحقق من حسابك قبل تسجيل الدخول.",
        "invalid_verification_token": "رمز التحقق غير صالح أو منتهي الصلاحية",
        "invalid_verification_token_request_new": "رمز التحقق غير صالح أو منتهي الصلاحية. يرجى طلب بريد إلكتروني جديد للتحقق.",
        "failed_to_confirm_email": "فشل في تأكيد البريد الإلكتروني",
        "email_confirmed_sign_in": "تم تأكيد البريد الإلكتروني ولكن لم يتم إنشاء جلسة. يرجى تسجيل الدخول.",
        "email_confirmed_sign_in_password": "تم تأكيد البريد الإلكتروني. يرجى تسجيل الدخول باستخدام بريدك الإلكتروني وكلمة المرور.",
        "failed_to_get_user_info": "فشل في الحصول على معلومات المستخدم",
        "failed_to_verify_email": "فشل في التحقق من البريد الإلكتروني",
        "failed_to_create_session": "فشل في إنشاء الجلسة بعد التحقق من البريد الإلكتروني",
        "email_verified_success": "تم التحقق من البريد الإلكتروني بنجاح. أنت الآن مسجل الدخول.",
        
        # Password reset
        "password_reset_sent": "إذا كان هناك حساب بهذا البريد الإلكتروني، تم إرسال رابط إعادة تعيين كلمة المرور.",
        "invalid_reset_token": "رمز إعادة التعيين غير صالح",
        "reset_token_expired": "انتهت صلاحية رمز إعادة التعيين. يرجى طلب رابط جديد لإعادة تعيين كلمة المرور.",
        "failed_to_reset_password": "فشل في إعادة تعيين كلمة المرور",
        "password_reset_success": "تم إعادة تعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.",
        "invalid_or_expired_reset_token": "رمز إعادة التعيين غير صالح أو منتهي الصلاحية. يرجى طلب رابط جديد لإعادة تعيين كلمة المرور.",
        
        # Profile update
        "failed_to_update_profile": "فشل في تحديث الملف الشخصي",
        "failed_to_update_email": "فشل في تحديث البريد الإلكتروني",
        "profile_updated_success": "تم تحديث الملف الشخصي بنجاح.",
        "profile_updated_email_sent": "تم تحديث الملف الشخصي بنجاح. تم إرسال بريد إلكتروني للتأكيد إلى {email}. يرجى التحقق من بريدك الإلكتروني لتأكيد العنوان الجديد.",
        "profile_updated_email_should_sent": "تم تحديث الملف الشخصي بنجاح. يجب أن يكون قد تم إرسال بريد إلكتروني للتأكيد إلى {email}. يرجى التحقق من بريدك الإلكتروني لتأكيد العنوان الجديد.",
        "user_profile_not_found": "الملف الشخصي للمستخدم غير موجود",
        "failed_to_retrieve_profile": "فشل في استرداد الملف الشخصي المحدث",
    },
}

