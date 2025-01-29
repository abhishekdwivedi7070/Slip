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
export async function createInvoice(clientName, amount, dueDate) {
  try {
    // Validate User Authentication
    const user = await account.get(); // Check if user is logged in
    if (!user) throw new Error("User not authenticated");

    // Validate Required Fields
    if (!clientName || !amount || !dueDate) throw new Error("Missing fields");

    // Convert Amount to Number
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) throw new Error("Invalid amount format");

    // Create Invoice Entry
    const newInvoice = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.invoiceCollectionId,
      ID.unique(), // Unique ID for each invoice
      {
        clientName,
        amount: parsedAmount,
        dueDate,
        userId: user.$id, // Storing which user created it
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
