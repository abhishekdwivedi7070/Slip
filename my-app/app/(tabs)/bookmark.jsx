import { useEffect, useState } from "react";
import { Text, FlatList, View, RefreshControl, TouchableOpacity, Alert, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAllInvoices, deleteInvoice, downloadInvoiceAsPDF } from "../../lib/appwrite";

const Bookmark = () => {
  const [invoices, setInvoices] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

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

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInvoices();
    setRefreshing(false);
  };

  const handleDelete = async (invoiceId) => {
    Alert.alert("Delete Invoice", "Are you sure you want to delete this invoice?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteInvoice(invoiceId);
            fetchInvoices();
          } catch (error) {
            Alert.alert("Error", error.message);
          }
        },
      },
    ]);
  };

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

      <FlatList
        data={invoices}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <View className="bg-gray-800 p-4 rounded-lg mb-3">
            <Text className="text-white font-bold">{item.clientName}</Text>

            <View className="flex-row mt-3">
              <TouchableOpacity className="bg-red-500 px-3 py-2 rounded-l mr-2" onPress={() => handleDelete(item.$id)}>
                <Text className="text-white">Delete</Text>
              </TouchableOpacity>

              <TouchableOpacity className="bg-blue-500 px-3 py-2 rounded-lg mr-2" onPress={() => handleDownload(item)}>
                <Text className="text-white">Download PDF</Text>
              </TouchableOpacity>

              {/* ✅ New View Image Button */}
              {item.imageLink ? (
                <TouchableOpacity
                  className="bg-green-500 px-3 py-2 rounded-lg"
                  onPress={() => Linking.openURL(item.imageLink)}
                >
                  <Text className="text-white">View Image</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </SafeAreaView>
  );
};

export default Bookmark;
