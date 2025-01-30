import { useEffect, useState } from "react";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Image, TouchableOpacity, Text, FlatList } from "react-native";

import { icons } from "../../constants";
import { signOut, getAllInvoices } from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";

const Profile = () => {
  const { user, setUser, setIsLogged } = useGlobalContext();
  const [invoices, setInvoices] = useState([]);

  // Fetch invoices on component mount
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const invoicesData = await getAllInvoices();
        setInvoices(invoicesData.reverse()); // Show recent first
      } catch (error) {
        console.error("Error fetching invoices:", error.message);
      }
    };

    fetchInvoices();
  }, []);

  const logout = async () => {
    await signOut();
    setUser(null);
    setIsLogged(false);
    router.replace("/sign-in");
  };

  return (
    <SafeAreaView className="bg-primary h-full flex justify-center items-center px-4">
      {/* Logout Button */}
      <TouchableOpacity
        onPress={logout}
        className="absolute top-12 right-5 p-2"
      >
        <Image
          source={icons.logout}
          resizeMode="contain"
          className="w-6 h-6"
        />
      </TouchableOpacity>

      {/* User Profile Section */}
      <View className="w-20 h-20 border border-secondary rounded-full flex justify-center items-center">
        <Image
          source={{ uri: user?.avatar || "https://via.placeholder.com/150" }}
          className="w-full h-full rounded-full"
          resizeMode="cover"
        />
      </View>

      {/* ✅ Updated User Name Display */}
      <Text className="text-white text-lg font-semibold mt-4">
        {user?.name || "User"}  
      </Text>

      {/* Recent Invoices History */}
      <Text className="text-gray-300 text-sm mt-6 mb-2">Recent Invoices</Text>
      <FlatList
        data={invoices}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <View className="bg-gray-800 p-4 rounded-lg mb-3 w-full">
            <Text className="text-white font-bold">{item.clientName}</Text>
            <Text className="text-gray-400">Amount: ₹{item.amount}</Text>
            <Text className="text-gray-400">Due: {item.dueDate}</Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <Text className="text-gray-500 mt-4">No invoices found.</Text>
        )}
      />
    </SafeAreaView>
  );
};

export default Profile;
