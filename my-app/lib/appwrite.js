import { Account, Client, Databases, ID, Query } from "react-native-appwrite";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { printToFileAsync } from "expo-print";

// 🔹 Appwrite Configuration
export const appwriteConfig = {
  endpoint: "https://cloud.appwrite.io/v1",
  projectId: "6799cf36003b5ae5095b",
  databaseId: "6799d01c002c1c088d50",
  invoiceCollectionId: "6799d02f000f1acf857d",
};

// 🔹 Initialize Appwrite Client
const client = new Client();
client.setEndpoint(appwriteConfig.endpoint).setProject(appwriteConfig.projectId);

// 🔹 Initialize Services
const account = new Account(client);
const databases = new Databases(client);

//  User Authentication Functions

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
    return await account.createEmailPasswordSession(email, password);
  } catch (error) {
    throw new Error(error.message);
  }
}


//  Add this function inside appwrite.js
export async function signOut() {
  try {
    await account.deleteSession("current"); // Delete current user session
    console.log("User signed out successfully.");
    return true;
  } catch (error) {
    console.error("Failed to sign out:", error.message);
    throw new Error(error.message);
  }
}


// Get Current User
export async function getCurrentUser() {
  try {
    return await account.get();
  } catch (error) {
    console.warn("User session not found or expired.");
    return null;
  }
}


//  Invoice Management Functions

// 🔹 Function to Create Invoice
export async function createInvoice(clientName, mobileNumber, amount, billingDate, dueDate) {
  try {
    const user = await account.get();
    if (!user) throw new Error("User not authenticated");

    if (!clientName || !mobileNumber || !amount || !billingDate || !dueDate)
      throw new Error("Missing fields");

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) throw new Error("Invalid amount format");

    const mobileNumberString = String(mobileNumber);
    if (!/^\d{10,15}$/.test(mobileNumberString)) {
      throw new Error("Invalid mobile number format (must be 10-15 digits)");
    }

    const newInvoice = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.invoiceCollectionId,
      ID.unique(),
      {
        clientName,
        mobileNumber: mobileNumberString,
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
// 🔹 Function to Fetch Invoices Based on User Role
export async function getAllInvoices() {
  try {
    const user = await account.get(); // Get the currently logged-in user
    if (!user) throw new Error("User not authenticated");

    let invoices;

    // Check if the user has an "admin" label
    if (user.labels && user.labels.includes("admin")) {
      //  Admin: Fetch all invoices
      invoices = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.invoiceCollectionId
      );
    } else {
      //  Normal User: Fetch only invoices created by them
      invoices = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.invoiceCollectionId,
        [Query.equal("userId", user.$id)] // 🔹 Filter by userId
      );
    }

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

//  3 PDF Generation & Download Function

export async function downloadInvoiceAsPDF(invoice) {
  try {
    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f4f4f4; }
          </style>
        </head>
        <body>
          <h1>Invoice</h1>
          <table>
            <tr><th>Client Name</th><td>${invoice.clientName}</td></tr>
            <tr><th>Mobile Number</th><td>${invoice.mobileNumber}</td></tr>
            <tr><th>Amount</th><td>₹${invoice.amount}</td></tr>
            <tr><th>Billing Date</th><td>${invoice.billingDate}</td></tr>
            <tr><th>Due Date</th><td>${invoice.dueDate}</td></tr>
          </table>
        </body>
      </html>
    `;

    const file = await printToFileAsync({ html, base64: false });
    const pdfUri = `${FileSystem.documentDirectory}invoice_${invoice.$id}.pdf`;

    await FileSystem.moveAsync({
      from: file.uri,
      to: pdfUri,
    });

    await Sharing.shareAsync(pdfUri, { mimeType: "application/pdf" });
    return pdfUri;
  } catch (error) {
    console.error("Failed to generate PDF:", error.message);
    throw new Error("Failed to generate PDF");
  }
}