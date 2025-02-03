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
import DateTimePicker from "@react-native-community/datetimepicker"; // ✅ Date Picker
import { createInvoice } from "../../lib/appwrite";

const Home = () => {
  // Invoice Form State
  const [form, setForm] = useState({
    clientName: "",
    mobileNumber: "",
    amount: "",
    billingDate: "",
    dueDate: "",
    imageLink: "", // ✅ New field for Image Link
  });

  // States for Date Picker Visibility
  const [showBillingDatePicker, setShowBillingDatePicker] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);

  // Handle Input Change
  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Handle Date Change
  const handleDateChange = (event, selectedDate, key) => {
    if (selectedDate) {
      handleChange(key, selectedDate.toISOString().split("T")[0]);
    }
    if (key === "billingDate") setShowBillingDatePicker(false);
    if (key === "dueDate") setShowDueDatePicker(false);
  };

  // Handle Invoice Submission
  const handleSubmit = async () => {
    if (!form.clientName || !form.mobileNumber || !form.amount || !form.billingDate || !form.dueDate) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    // ✅ Validate Mobile Number: Must be between 10 and 12 digits
    if (!/^\d{10,12}$/.test(form.mobileNumber)) {
      Alert.alert("Error", "Mobile number must be between 10 to 12 digits");
      return;
    }

    try {
      const result = await createInvoice(
        form.clientName,
        String(form.mobileNumber),
        form.amount,
        form.billingDate,
        form.dueDate,
        form.imageLink // ✅ Include image link in invoice creation
      );

      console.log("Invoice successfully created:", result);

      // Reset Form
      setForm({ clientName: "", mobileNumber: "", amount: "", billingDate: "", dueDate: "", imageLink: "" });

      Alert.alert("Success", "Invoice created successfully!");
    } catch (error) {
      console.error("Invoice creation error:", error.message);
      Alert.alert("Error", error.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900 px-4 pt-10">
      {/* Wrap in ScrollView & KeyboardAvoidingView */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ flexGrow: 1 }} 
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="mt-2 mb-4">
            <Text className="text-3xl font-bold text-white">Invoice Builder</Text>
            <Text className="text-gray-400">Manage your invoices easily</Text>
          </View>

          {/* Invoice Form */}
          <View className="bg-gray-800 p-4 rounded-2xl mb-6">
            <Text className="text-white mb-2">Image Link</Text>
            <TextInput
              className="bg-gray-700 text-white p-3 rounded-lg mb-3"
              placeholder="Enter image link (optional)"
              placeholderTextColor="#A0A0A0"
              value={form.imageLink}
              onChangeText={(text) => handleChange("imageLink", text)}
            />

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

            {/* ✅ Billing Date Picker */}
            <Text className="text-white mb-2">Billing Date</Text>
            <TouchableOpacity 
              className="bg-gray-700 text-white p-3 rounded-lg mb-3"
              onPress={() => setShowBillingDatePicker(true)}
            >
              <Text className="text-gray-300">{form.billingDate || "Select Billing Date"}</Text>
            </TouchableOpacity>
            {showBillingDatePicker && (
              <DateTimePicker
                value={form.billingDate ? new Date(form.billingDate) : new Date()}
                mode="date"
                display="default"
                onChange={(event, date) => handleDateChange(event, date, "billingDate")}
              />
            )}

            {/* ✅ Due Date Picker */}
            <Text className="text-white mb-2">Due Date</Text>
            <TouchableOpacity 
              className="bg-gray-700 text-white p-3 rounded-lg mb-3"
              onPress={() => setShowDueDatePicker(true)}
            >
              <Text className="text-gray-300">{form.dueDate || "Select Due Date"}</Text>
            </TouchableOpacity>
            {showDueDatePicker && (
              <DateTimePicker
                value={form.dueDate ? new Date(form.dueDate) : new Date()}
                mode="date"
                display="default"
                onChange={(event, date) => handleDateChange(event, date, "dueDate")}
              />
            )}

            {/* Submit Button */}
            <TouchableOpacity
              className="bg-blue-500 p-4 rounded-lg items-center"
              onPress={handleSubmit}
            >
              <Text className="text-white font-bold">Submit Invoice</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Home;
