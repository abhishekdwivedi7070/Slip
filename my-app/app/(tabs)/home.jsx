import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { createInvoice } from "../../lib/appwrite";

const Home = () => {
  // Invoice Form State
  const [form, setForm] = useState({
    clientName: "",
    mobileNumber: "",
    amount: "",
    billingDate: "",
    dueDate: "",
  });

  // Handle Input Change
  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Handle Invoice Submission
  const handleSubmit = async () => {
    if (!form.clientName || !form.mobileNumber || !form.amount || !form.billingDate || !form.dueDate) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    // Validate Mobile Number as String
    if (!/^\d{10,15}$/.test(form.mobileNumber)) {
      Alert.alert("Error", "Invalid mobile number format (must be 10-15 digits)");
      return;
    }

    try {
      const result = await createInvoice(
        form.clientName,
        String(form.mobileNumber),  // 🔹 Ensure mobileNumber is a string
        form.amount,
        form.billingDate,
        form.dueDate
      );

      console.log("Invoice successfully created:", result);

      // Reset Form
      setForm({ clientName: "", mobileNumber: "", amount: "", billingDate: "", dueDate: "" });

      Alert.alert("Success", "Invoice created successfully!");
    } catch (error) {
      console.error("Invoice creation error:", error.message);
      Alert.alert("Error", error.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900 px-4 pt-10">  
      {/* 🔹 Added `pt-10` for proper top padding to avoid notch overlap */}

      {/* Header */}
      <View className="mt-2 mb-4">
        <Text className="text-3xl font-bold text-white">Invoice Builder</Text>
        <Text className="text-gray-400">Manage your invoices easily</Text>
      </View>

      {/* Invoice Form */}
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
        <TextInput
          className="bg-gray-700 text-white p-3 rounded-lg mb-3"
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#A0A0A0"
          value={form.billingDate}
          onChangeText={(text) => handleChange("billingDate", text)}
        />

        <Text className="text-white mb-2">Due Date</Text>
        <TextInput
          className="bg-gray-700 text-white p-3 rounded-lg mb-3"
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#A0A0A0"
          value={form.dueDate}
          onChangeText={(text) => handleChange("dueDate", text)}
        />

        {/* Submit Button */}
        <TouchableOpacity
          className="bg-blue-500 p-4 rounded-lg items-center"
          onPress={handleSubmit}
        >
          <Text className="text-white font-bold">Submit Invoice</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Home;
