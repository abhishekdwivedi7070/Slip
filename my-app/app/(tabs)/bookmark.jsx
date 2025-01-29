import { useEffect, useState } from "react";
import { Text, FlatList, View, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { getAllInvoices } from "../../lib/appwrite";
import useAppwrite from "../../lib/useAppwrite";

const Bookmark = () => {
  // Fetch invoices from Appwrite
  const { data: invoices, refetch, loading } = useAppwrite(getAllInvoices);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  // Handle Refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Fetch invoices when the component mounts
  useEffect(() => {
    refetch();
  }, []);

  return (
    <SafeAreaView className="px-4 my-6 bg-primary h-full">
      <Text className="text-2xl text-white font-psemibold">Recent Invoices</Text>

      {loading ? (
        <Text className="text-gray-400 text-center mt-4">Loading invoices...</Text>
      ) : invoices?.length === 0 ? (
        <Text className="text-gray-400 text-center mt-4">No invoices found.</Text>
      ) : (
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
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </SafeAreaView>
  );
};

export default Bookmark;
