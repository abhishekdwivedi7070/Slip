import { useEffect, useState } from "react";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Image, FlatList, TouchableOpacity, Text } from "react-native";

import { icons } from "../../constants";
import { getCurrentUser, getAllInvoices, signOut } from "../../lib/appwrite";
import { EmptyState, InfoBox } from "../../components";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch User & Invoices
  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          const invoicesData = await getAllInvoices();
          setInvoices(invoicesData);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle Logout
  const logout = async () => {
    await signOut();
    setUser(null);
    router.replace("/sign-in");
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={invoices}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <View className="bg-gray-800 p-4 rounded-lg mb-3">
            <Text className="text-white font-bold">{item.clientName}</Text>
            <Text className="text-gray-400">Amount: ₹{item.amount}</Text>
            <Text className="text-gray-400">Due: {item.dueDate}</Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState title="No Invoices" subtitle="You haven't created any invoices yet." />
        )}
        ListHeaderComponent={() => (
          <View className="w-full flex justify-center items-center mt-6 mb-8 px-4">
            {/* Logout Button */}
            <TouchableOpacity onPress={logout} className="flex w-full items-end mb-8">
              <Image source={icons.logout} resizeMode="contain" className="w-6 h-6" />
            </TouchableOpacity>

            {/* User Profile */}
            <View className="w-16 h-16 border border-secondary rounded-lg flex justify-center items-center">
              <Image
                source={{ uri: user?.avatar || "https://via.placeholder.com/150" }}
                className="w-[90%] h-[90%] rounded-lg"
                resizeMode="cover"
              />
            </View>

            <InfoBox title={user?.name || "User"} containerStyles="mt-5" titleStyles="text-lg" />

            {/* Invoice Stats */}
            <View className="mt-5 flex flex-row">
              <InfoBox
                title={invoices.length || 0}
                subtitle="Invoices"
                titleStyles="text-xl"
                containerStyles="mr-10"
              />
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default Profile;
