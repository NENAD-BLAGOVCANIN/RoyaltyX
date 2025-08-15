import { apiUrl } from "../../common/api/config";

export const requestAccessTokenFromInstagram = async (code) => {
  try {
    const url = `${apiUrl}/oauth/instagram/exchange/`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code: code })
    });

    const responseData = await response.json();

    if (response.ok) {
      return responseData;
    } else {
      throw new Error(responseData.errors);
    }
  } catch (error) {
    throw new Error(error);
  }
};
