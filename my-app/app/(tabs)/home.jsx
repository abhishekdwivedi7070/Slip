import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker"; 
import { createInvoice } from "../../lib/appwrite";
import * as DocumentPicker from "expo-document-picker"; 

const Home = () => {
  const [form, setForm] = useState({
    clientName: "",
    mobileNumber: "",
    amount: "",
    billingDate: "",
    dueDate: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const [showBillingDatePicker, setShowBillingDatePicker] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleDateChange = (event, selectedDate, key) => {
    if (selectedDate) {
      handleChange(key, selectedDate.toISOString().split("T")[0]);
    }
    if (key === "billingDate") setShowBillingDatePicker(false);
    if (key === "dueDate") setShowDueDatePicker(false);
  };

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
      });

      if (result.canceled) return;
      setSelectedFile(result.assets[0].uri);
    } catch (error) {
      console.error("Error picking file:", error);
    }
  };
//handle submit function
const handleSubmit = async () => {
  if (!form.clientName || !form.mobileNumber || !form.amount || !form.billingDate || !form.dueDate) {
    Alert.alert("Error", "Please fill all fields");
    return;
  }

  if (!selectedFile) {
    Alert.alert("Error", "Please upload an invoice file (PDF or Image).");
    return;
  }

  try {
    await createInvoice(
      form.clientName,
      String(form.mobileNumber),
      parseInt(form.amount, 10), // 🔹 Ensure amount is an integer
      form.billingDate,
      form.dueDate,
      selectedFile
    );

    setForm({ clientName: "", mobileNumber: "", amount: "", billingDate: "", dueDate: "" });
    setSelectedFile(null);
    Alert.alert("Success", "Invoice created successfully!");
  } catch (error) {
    Alert.alert("Error", error.message);
  }
};

  return (
    <SafeAreaView className="flex-1 bg-gray-900 px-4 pt-10">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="mt-2 mb-4">
            <Text className="text-3xl font-bold text-white">Invoice Builder</Text>
            <Text className="text-gray-400">Manage your invoices easily</Text>
          </View>

          <View className="bg-gray-800 p-4 rounded-2xl mb-6">
            <Text className="text-white mb-2">Client Name</Text>
            <TextInput
              className="bg-gray-700 text-white p-3 rounded-lg mb-3"
              placeholder="Enter client name"
              placeholderTextColor="#A0A0A0"
              value={form.clientName}
              onChangeText={(text) => handleChange("clientName", text)}
            />

            <Text className="text-white mb-2">Mobile Number</Text>
            <TextInput
              className="bg-gray-700 text-white p-3 rounded-lg mb-3"
              placeholder="Enter mobile number"
              placeholderTextColor="#A0A0A0"
              keyboardType="numeric"
              value={form.mobileNumber}
              onChangeText={(text) => handleChange("mobileNumber", text)}
            />

            <Text className="text-white mb-2">Amount</Text>
            <TextInput
              className="bg-gray-700 text-white p-3 rounded-lg mb-3"
              placeholder="Enter amount"
              placeholderTextColor="#A0A0A0"
              keyboardType="numeric"
              value={form.amount}
              onChangeText={(text) => handleChange("amount", text)}
            />

            <Text className="text-white mb-2">Billing Date</Text>
            <TouchableOpacity className="bg-gray-700 text-white p-3 rounded-lg mb-3" onPress={() => setShowBillingDatePicker(true)}>
              <Text className="text-gray-300">{form.billingDate || "Select Billing Date"}</Text>
            </TouchableOpacity>
            {showBillingDatePicker && (
              <DateTimePicker value={form.billingDate ? new Date(form.billingDate) : new Date()} mode="date" display="default" onChange={(event, date) => handleDateChange(event, date, "billingDate")} />
            )}

            <Text className="text-white mb-2">Due Date</Text>
            <TouchableOpacity className="bg-gray-700 text-white p-3 rounded-lg mb-3" onPress={() => setShowDueDatePicker(true)}>
              <Text className="text-gray-300">{form.dueDate || "Select Due Date"}</Text>
            </TouchableOpacity>
            {showDueDatePicker && (
              <DateTimePicker value={form.dueDate ? new Date(form.dueDate) : new Date()} mode="date" display="default" onChange={(event, date) => handleDateChange(event, date, "dueDate")} />
            )}

            <TouchableOpacity className="bg-gray-700 text-white p-3 rounded-lg mb-3" onPress={pickFile}>
              <Text className="text-gray-300">{selectedFile ? "File Selected ✅" : "Upload Invoice (PDF/Image)"}</Text>
            </TouchableOpacity>

            <TouchableOpacity className="bg-blue-500 p-4 rounded-lg items-center" onPress={handleSubmit}>
              <Text className="text-white font-bold">Submit Invoice</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Home;
