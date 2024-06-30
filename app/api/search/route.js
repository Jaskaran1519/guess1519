//app/api/search/route.js
import { NextResponse } from "next/server";
import fetch from "node-fetch";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "coffee"; // Default to 'coffee' if no query provided
  const url = `https://www.google.com/complete/search?client=firefox&q=${encodeURIComponent(
    query
  )}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log("Raw response data:", JSON.stringify(data, null, 2)); // Log the raw response for debugging

    if (response.ok) {
      const suggestions = data[1].map((item) =>
        Array.isArray(item) ? item[0] : item
      );
      return NextResponse.json({ suggestions });
    } else {
      console.error("Failed to fetch autocomplete suggestions:", data);
      return NextResponse.json(
        { error: "Failed to fetch autocomplete suggestions" },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error("Error fetching autocomplete suggestions:", error);
    return NextResponse.json(
      { error: "Error fetching autocomplete suggestions" },
      { status: 500 }
    );
  }
}
