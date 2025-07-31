import { apiUrl } from "../../common/api/config";

export const login = async (user) => {
  try {
    const response = await fetch(apiUrl + "/authentication/token/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.detail || "Login failed");
    }

    return responseData;
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const register = async (user) => {
  try {
    const response = await fetch(apiUrl + "/authentication/register/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(user),
    });

    const responseData = await response.json();

    if (response.ok) {
      return { 
        success: true, 
        message: responseData.message || "Registration successful", 
        data: responseData,
        verification_required: responseData.verification_required,
        email: responseData.email
      };
    } else {
      // Handle field-specific errors from Django serializer
      if (responseData && typeof responseData === 'object') {
        return { 
          success: false, 
          errors: responseData,
          message: "Please fix the errors below"
        };
      } else {
        return { 
          success: false, 
          message: responseData.detail || responseData.message || "Registration failed"
        };
      }
    }
  } catch (error) {
    // Handle network errors or other exceptions
    return { 
      success: false, 
      message: error.message || "Network error. Please try again."
    };
  }
};

export const verifyEmail = async (email, code) => {
  try {
    const response = await fetch(apiUrl + "/authentication/verify-email/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        code: code,
      }),
    });

    const responseData = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: responseData.message,
        data: responseData,
        access: responseData.access,
        refresh: responseData.refresh,
      };
    } else {
      return {
        success: false,
        message: responseData.error || "Verification failed",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.message || "Network error. Please try again.",
    };
  }
};

export const resendVerification = async (email) => {
  try {
    const response = await fetch(apiUrl + "/authentication/resend-verification/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
      }),
    });

    const responseData = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: responseData.message,
      };
    } else {
      return {
        success: false,
        message: responseData.error || "Failed to resend verification email",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.message || "Network error. Please try again.",
    };
  }
};

export const resetPassword = async (data) => {
  const token = localStorage.getItem("accessToken");

  try {
    const response = await fetch(apiUrl + "/authentication/change-password/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error);
    }

    return { success: true, message: responseData };
  } catch (error) {
    return { success: false, message: error.message };
  }
};
