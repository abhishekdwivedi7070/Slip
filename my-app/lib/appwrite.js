import { Account, Client, Databases, ID, Query, Storage, InputFile } from "react-native-appwrite";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { printToFileAsync } from "expo-print";

// 🔹 Appwrite Configuration
export const appwriteConfig = {
  endpoint: "https://cloud.appwrite.io/v1",
  projectId: "6799cf36003b5ae5095b",
  databaseId: "6799d01c002c1c088d50",
  invoiceCollectionId: "6799d02f000f1acf857d",
  bucketId: "67a07f22003cca390dcb",
};

// 🔹 Initialize Appwrite Client
const client = new Client();
client.setEndpoint(appwriteConfig.endpoint).setProject(appwriteConfig.projectId);

// 🔹 Initialize Services
const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

// User Authentication Functions

export async function createUser(email, password, username) {
  try {
    const newAccount = await account.create(ID.unique(), email, password, username);
    if (!newAccount) throw new Error("Account creation failed");

    await signIn(email, password);
    return newAccount;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function signIn(email, password) {
  try {
    return await account.createEmailSession(email, password);
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function signOut() {
  try {
    await account.deleteSession("current");
    console.log("User signed out successfully.");
    return true;
  } catch (error) {
    console.error("Failed to sign out:", error.message);
    throw new Error(error.message);
  }
}

export async function getCurrentUser() {
  try {
    return await account.get();
  } catch (error) {
    console.warn("⚠ User session not found or expired.");
    return null;
  }
}

// Invoice Management Functions
export async function createInvoice(clientName, mobileNumber, amount, billingDate, dueDate, fileUri) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.$id) throw new Error("User not authenticated");

    let uploadedFileId = null;
    if (fileUri) {
      uploadedFileId = await uploadInvoiceFile(fileUri);
    }

    const newInvoice = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.invoiceCollectionId,
      ID.unique(),
      {
        clientName,
        mobileNumber,
        amount,
        billingDate,
        dueDate,
        uploadedInvoice: uploadedFileId,
        userId: user.$id,
      }
    );

    console.log(" Invoice Created:", newInvoice);
    return newInvoice;
  } catch (error) {
    console.error(" Failed to create invoice:", error.message);
    throw new Error(error.message);
  }
}

// 🔹 Function to Upload Invoice File

export async function uploadInvoiceFile(fileUri) {
  try {
    console.log("🔹 Uploading File:", fileUri);

    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) throw new Error(" File does not exist at URI: " + fileUri);

    
    const response = await storage.createFile(
      appwriteConfig.bucketId,
      ID.unique(),
      { uri: fileUri, name: "invoice.pdf", type: "application/pdf" }
    );
    
    

    console.log(" File Upload Successful:", response);
    return response?.$id;
  } catch (error) {
    console.error(" File Upload Failed:", error.message);
    throw error;
  }
}

// 🔹 Function to Fetch Invoices
export async function getAllInvoices() {
  try {
    const user = await getCurrentUser();
    if (!user || !user.$id) throw new Error("User not authenticated");

    let query = [];

    if (!user.labels || !user.labels.includes("admin")) {
      query.push(Query.equal("userId", user.$id));
    }

    const invoices = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.invoiceCollectionId,
      query.length ? query : undefined
    );

    return invoices.documents;
  } catch (error) {
    console.error(" Failed to fetch invoices:", error.message);
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
    console.log(" Invoice deleted successfully:", invoiceId);
    return true;
  } catch (error) {
    console.error(" Failed to delete invoice:", error.message);
    throw new Error(error.message);
  }
}

// 🔹 Function to Download & Share Invoice as PDF
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
    console.error(" Failed to generate PDF:", error.message);
    throw new Error("Failed to generate PDF");
  }
}
