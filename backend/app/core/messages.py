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
        "email_not_confirmed": "Your email address has not been confirmed. Please check your email and click the confirmation link before logging in.",
        
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
        "email_already_exists": "This email address is already registered to another account. Please use a different email address.",
        "profile_updated_success": "Profile updated successfully.",
        "profile_updated_email_sent": "Profile updated successfully. A confirmation email has been sent to {email}. Please check your email to confirm the new address.",
        "profile_updated_email_should_sent": "Profile updated successfully. A confirmation email should have been sent to {email}. Please check your email to confirm the new address.",
        "email_changed_suspended": "Your email has been changed. A confirmation email has been sent to your new email address. You can continue using your account now, but you must verify your new email before your next login.",
        "user_profile_not_found": "User profile not found",
        "failed_to_retrieve_profile": "Failed to retrieve updated profile",
        
        # Generic error codes
        "resource_not_found": "The requested resource was not found",
        "validation_failed": "The provided data is invalid. Please check your input and try again.",
        "unauthorized": "You are not authorized to perform this action. Please log in.",
        "forbidden": "You do not have permission to access this resource.",
        "conflict": "A conflict occurred. The resource may have been modified by another user.",
        "insufficient_stock": "Insufficient stock available for this product.",
        "internal_server_error": "An unexpected error occurred. Please try again later. If the problem persists, contact support.",
        "order_create_failed": "Failed to create order. Please try again.",
        "cart_empty": "Your cart is empty. Add items before placing an order.",
        "payment_failed": "Payment processing failed. Please check your payment method and try again.",
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
        "email_not_confirmed": "Votre adresse e-mail n'a pas été confirmée. Veuillez vérifier votre e-mail et cliquer sur le lien de confirmation avant de vous connecter.",
        
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
        "email_already_exists": "Cette adresse e-mail est déjà enregistrée sur un autre compte. Veuillez utiliser une autre adresse e-mail.",
        "profile_updated_success": "Profil mis à jour avec succès.",
        "profile_updated_email_sent": "Profil mis à jour avec succès. Un e-mail de confirmation a été envoyé à {email}. Veuillez vérifier votre e-mail pour confirmer la nouvelle adresse.",
        "profile_updated_email_should_sent": "Profil mis à jour avec succès. Un e-mail de confirmation devrait avoir été envoyé à {email}. Veuillez vérifier votre e-mail pour confirmer la nouvelle adresse.",
        "email_changed_suspended": "Votre e-mail a été modifié. Un e-mail de confirmation a été envoyé à votre nouvelle adresse e-mail. Vous pouvez continuer à utiliser votre compte maintenant, mais vous devez vérifier votre nouvel e-mail avant votre prochaine connexion.",
        "user_profile_not_found": "Profil utilisateur introuvable",
        "failed_to_retrieve_profile": "Échec de la récupération du profil mis à jour",
        
        # Generic error codes
        "resource_not_found": "La ressource demandée est introuvable",
        "validation_failed": "Les données fournies sont invalides. Veuillez vérifier vos informations et réessayer.",
        "unauthorized": "Vous n'êtes pas autorisé à effectuer cette action. Veuillez vous connecter.",
        "forbidden": "Vous n'avez pas la permission d'accéder à cette ressource.",
        "conflict": "Un conflit s'est produit. La ressource a peut-être été modifiée par un autre utilisateur.",
        "insufficient_stock": "Stock insuffisant disponible pour ce produit.",
        "internal_server_error": "Une erreur inattendue s'est produite. Veuillez réessayer plus tard. Si le problème persiste, contactez le support.",
        "order_create_failed": "Échec de la création de la commande. Veuillez réessayer.",
        "cart_empty": "Votre panier est vide. Ajoutez des articles avant de passer une commande.",
        "payment_failed": "Le traitement du paiement a échoué. Veuillez vérifier votre méthode de paiement et réessayer.",
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
        "email_not_confirmed": "لم يتم تأكيد عنوان بريدك الإلكتروني. يرجى التحقق من بريدك الإلكتروني والنقر على رابط التأكيد قبل تسجيل الدخول.",
        
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
        "email_already_exists": "عنوان البريد الإلكتروني هذا مسجل بالفعل على حساب آخر. يرجى استخدام عنوان بريد إلكتروني مختلف.",
        "profile_updated_success": "تم تحديث الملف الشخصي بنجاح.",
        "profile_updated_email_sent": "تم تحديث الملف الشخصي بنجاح. تم إرسال بريد إلكتروني للتأكيد إلى {email}. يرجى التحقق من بريدك الإلكتروني لتأكيد العنوان الجديد.",
        "profile_updated_email_should_sent": "تم تحديث الملف الشخصي بنجاح. يجب أن يكون قد تم إرسال بريد إلكتروني للتأكيد إلى {email}. يرجى التحقق من بريدك الإلكتروني لتأكيد العنوان الجديد.",
        "email_changed_suspended": "تم تغيير بريدك الإلكتروني. تم إرسال بريد إلكتروني للتأكيد إلى عنوان بريدك الإلكتروني الجديد. يمكنك متابعة استخدام حسابك الآن، ولكن يجب عليك التحقق من بريدك الإلكتروني الجديد قبل تسجيل الدخول التالي.",
        "user_profile_not_found": "الملف الشخصي للمستخدم غير موجود",
        "failed_to_retrieve_profile": "فشل في استرداد الملف الشخصي المحدث",
        
        # Generic error codes
        "resource_not_found": "الموارد المطلوبة غير موجودة",
        "validation_failed": "البيانات المقدمة غير صالحة. يرجى التحقق من معلوماتك والمحاولة مرة أخرى.",
        "unauthorized": "غير مصرح لك بتنفيذ هذا الإجراء. يرجى تسجيل الدخول.",
        "forbidden": "ليس لديك إذن للوصول إلى هذا المورد.",
        "conflict": "حدث تعارض. ربما تم تعديل المورد من قبل مستخدم آخر.",
        "insufficient_stock": "المخزون غير كافٍ لهذا المنتج.",
        "internal_server_error": "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى لاحقاً. إذا استمرت المشكلة، اتصل بالدعم.",
        "order_create_failed": "فشل في إنشاء الطلب. يرجى المحاولة مرة أخرى.",
        "cart_empty": "سلة التسوق الخاصة بك فارغة. أضف العناصر قبل تقديم الطلب.",
        "payment_failed": "فشل معالجة الدفع. يرجى التحقق من طريقة الدفع والمحاولة مرة أخرى.",
    },
}

