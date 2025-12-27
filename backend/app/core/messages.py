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
        "password_requirements_not_met": "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character.",
        
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
        "password_requirements_not_met": "Le mot de passe doit contenir au moins une lettre minuscule, une lettre majuscule, un chiffre et un caractère spécial.",
        
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
}

