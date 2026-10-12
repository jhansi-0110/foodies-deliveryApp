import axios from "axios";
import { API_BASE_URL } from "../../config";

const API_URL = `${API_BASE_URL}/foods`;

export const fetchFoodList = async () => {
    try{
        const response=await axios.get(API_URL);
        return response.data;
    }
    catch(error){
        console.log('Error',error);
        throw error;
    }

};

export const fetchFoodDetails = async (id) => {
    try{
        const response=await axios.get(`${API_URL}/${id}`);
        return response.data;
    }
    catch(error){
        console.log("error fetching the food details: ",error);
        throw error;
    }
}
