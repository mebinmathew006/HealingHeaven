 import React, { useEffect, useState } from "react";
 import {  Loader2} from "lucide-react";

 export default function LoadingSpinner() {
    return(
    <div className="max-w-6xl mx-auto p-6 bg-white">
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Consultations</h3>
        <p className="text-gray-500">Please wait while we fetch your consultation history</p>
      </div>
    </div>
  );

 } 