import { apiUrl } from "../../common/api/config";

export const getConversations = async () => {
    try {
        const token = localStorage.getItem("accessToken");

        const response = await fetch(apiUrl + "/inbox/conversations/", {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
            },
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