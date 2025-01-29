import { useEffect, useState } from "react";
import { Text, FlatList, View, RefreshControl, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { getAllInvoices, deleteInvoice, downloadInvoiceAsPDF } from "../../lib/appwrite";

const Bookmark = () => {
  const [invoices, setInvoices] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  // Fetch invoices
  const fetchInvoices = async () => {
    try {
      const data = await getAllInvoices();
      setInvoices(data);
    } catch (error) {
      console.error("Failed to fetch invoices:", error.message);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Handle Refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInvoices();
    setRefreshing(false);
  };

  // Handle Invoice Deletion
  const handleDelete = async (invoiceId) => {
    Alert.alert("Delete Invoice", "Are you sure you want to delete this invoice?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteInvoice(invoiceId);
            fetchInvoices(); // Refresh list after deletion
          } catch (error) {
            Alert.alert("Error", error.message);
          }
        },
      },
    ]);
  };

  // Handle Invoice Download
  const handleDownload = async (invoice) => {
    try {
      await downloadInvoiceAsPDF(invoice);
      Alert.alert("Success", "Invoice PDF generated successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to generate PDF");
    }
  };

  return (
    <SafeAreaView className="px-4 my-6 bg-primary h-full">
      <Text className="text-2xl text-white font-psemibold">Recent Invoices</Text>

      {invoices.length === 0 ? (
        <Text className="text-gray-400 text-center mt-4">No invoices found.</Text>
      ) : (
        <FlatList
          data={invoices}
          keyExtractor={(item) => item.$id}
          renderItem={({ item }) => (
            <View className="bg-gray-800 p-4 rounded-lg mb-3">
              <Text className="text-white font-bold">{item.clientName}</Text>
              <Text className="text-gray-400">Mobile: {item.mobileNumber}</Text>
              <Text className="text-gray-400">Amount: ₹{item.amount}</Text>
              <Text className="text-gray-400">Billing Date: {item.billingDate}</Text>
              <Text className="text-gray-400">Due: {item.dueDate}</Text>

              {/* Buttons Container */}
              <View className="flex-row mt-4">
                {/* Delete Button */}
                <TouchableOpacity className="bg-red-500 px-3 py-2 rounded-lg mr-2" onPress={() => handleDelete(item.$id)}>
                  <Text className="text-white">Delete</Text>
                </TouchableOpacity>

                {/* Download PDF Button */}
                <TouchableOpacity className="bg-blue-500 px-3 py-2 rounded-lg" onPress={() => handleDownload(item)}>
                  <Text className="text-white">Download PDF</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </SafeAreaView>
  );
};

export default Bookmark;
