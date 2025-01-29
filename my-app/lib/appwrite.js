import { Account, Client, Databases, ID, Query } from "react-native-appwrite";

// 🔹 Update Appwrite Configuration
export const appwriteConfig = {
  endpoint: "https://cloud.appwrite.io/v1", // Appwrite API endpoint
  projectId: "6799cf36003b5ae5095b", // Your Appwrite Project ID
  databaseId: "6799d01c002c1c088d50", // Your Appwrite Database ID
  invoiceCollectionId: "6799d02f000f1acf857d", // Your Invoice Collection ID
};

// 🔹 Initialize Appwrite Client
const client = new Client();
client
  .setEndpoint(appwriteConfig.endpoint) // Set API Endpoint
  .setProject(appwriteConfig.projectId); // Set Project ID

// 🔹 Initialize Services
const account = new Account(client); // User Authentication
const databases = new Databases(client); // Database Access

// ✅ 1️⃣ User Authentication Functions

// Register User
export async function createUser(email, password, username) {
  try {
    const newAccount = await account.create(ID.unique(), email, password, username);
    if (!newAccount) throw new Error("Account creation failed");

    // Auto Sign-in After Registration
    await signIn(email, password);
    return newAccount;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Sign In
export async function signIn(email, password) {
  try {
    return await account.createEmailSession(email, password);
  } catch (error) {
    throw new Error(error.message);
  }
}

// Get Current User
export async function getCurrentUser() {
  try {
    return await account.get();
  } catch (error) {
    return null; // Return null if user is not logged in
  }
}

// Sign Out
export async function signOut() {
  try {
    return await account.deleteSession("current");
  } catch (error) {
    throw new Error(error.message);
  }
}

// ✅ 2️⃣ Invoice Management Functions

// 🔹 Function to Create Invoice
export async function createInvoice(clientName, mobileNumber, amount, billingDate, dueDate) {
  try {
    const user = await account.get();
    if (!user) throw new Error("User not authenticated");

    if (!clientName || !mobileNumber || !amount || !billingDate || !dueDate)
      throw new Error("Missing fields");

    // Convert Amount to Number
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) throw new Error("Invalid amount format");

    // Ensure Mobile Number is a String
    const mobileNumberString = String(mobileNumber); 

    // Validate Mobile Number Format
    if (!/^\d{10,15}$/.test(mobileNumberString)) {
      throw new Error("Invalid mobile number format (must be 10-15 digits)");
    }

    // Create Invoice Entry
    const newInvoice = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.invoiceCollectionId,
      ID.unique(),
      {
        clientName,
        mobileNumber: mobileNumberString,  // 🔹 Ensure it's a string here
        amount: parsedAmount,
        billingDate,
        dueDate,
        userId: user.$id,
      }
    );

    console.log("Invoice Created:", newInvoice);
    return newInvoice;
  } catch (error) {
    console.error("Failed to create invoice:", error.message);
    throw new Error(error.message);
  }
}


// 🔹 Function to Fetch All Invoices
export async function getAllInvoices() {
  try {
    const invoices = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.invoiceCollectionId
    );
    return invoices.documents;
  } catch (error) {
    console.error("Failed to fetch invoices:", error.message);
    throw new Error(error.message);
  }
}
// 🔹 Function to Delete Invoice
export async function deleteInvoice(invoiceId) {
  try {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.invoiceCollectionId,
      invoiceId
    );
    console.log("Invoice deleted successfully:", invoiceId);
    return true;
  } catch (error) {
    console.error("Failed to delete invoice:", error.message);
    throw new Error(error.message);
  }
}


