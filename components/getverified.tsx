"use client";
import React, { useState } from 'react'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, } from "lucide-react";
import axios from "axios";
import { MdVerified } from 'react-icons/md'

const Getverified = () => {

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    reason: "",
    proof: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(
    null
  );

  const toggleForm = () => {
    setIsOpen(!isOpen);
    setSubmitStatus(null);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post("/api/getverified", {
        ...formData,
      });

      if (response.status === 200) {
        setSubmitStatus("success");
        setFormData({
          fullname: "",
          email: "",
          reason: "",
          proof: ""
        });
      } else {
        setSubmitStatus("error");
      }
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <>
      <button onClick={toggleForm} className="flex items-center gap-2 px-3 py-1 text-xs font-medium text-black dark:text-white bg-white dark:bg-black border border-neutral-400 dark:border-neutral-700 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors ml-2">
        <MdVerified size={14} fill="#1D9BF0" />
        <span>Get verified</span>
      </button>

      {isOpen && (
        <div
          onClick={toggleForm}
          className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50 z-[999]"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-[450px] shadow-2xl relative"
          >
            <button
              className="absolute top-4 right-4 p-1 rounded-full text-gray-800 hover:bg-gray-200"
              onClick={toggleForm}
            >
              <X size={20} />
            </button>

            <div className="px-6 py-6 text-gray-800">
              <h2 className="text-xl font-bold mb-1 flex flex-row gap-1 items-center">
                Request Profile Verification <MdVerified size={16} fill="#1D9BF0" />
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Your full name"
                    className="bg-white border-neutral-200"
                    value={formData.fullname}
                    onChange={(e) =>
                      setFormData({ ...formData, fullname: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    className="bg-white border-neutral-200"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Why should you be verified?</Label>
                  <Textarea
                    id="reason"
                    name="reason"
                    placeholder="Explain why you should get verified — e.g., you’re a notable figure, content creator, or trusted community member."
                    className="bg-white border-neutral-200"
                    value={formData.reason}
                    maxLength={500}
                    onChange={(e) =>
                      setFormData({ ...formData, reason: e.target.value })
                    }
                    required
                  />
                  <p className="text-xs text-gray-500 text-right">
                    {formData.reason.length}/500
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proof">Proof of authenticity (optional)</Label>
                  <Input
                    id="proof"
                    name="proof"
                    type="url"
                    placeholder="Link to your website, social profile, or other proof"
                    className="bg-white border-neutral-200"
                    value={formData.proof}
                    onChange={(e) =>
                      setFormData({ ...formData, proof: e.target.value })
                    }
                  />
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-opacity disabled:opacity-50"
                  >
                    {isSubmitting ? "Submitting..." : "Request Verification"}
                  </Button>
                </div>

                {submitStatus === "success" && (
                  <p className="text-green-600 text-center text-xs">
                    Verification request submitted successfully!
                  </p>
                )}
                {submitStatus === "error" && (
                  <p className="text-red-600 text-center text-xs">
                    Failed to submit. Please try again.
                  </p>
                )}
              </form>
            </div>

            <div className="bg-gray-100 rounded-b-2xl px-6 py-3 text-center">
              <p className="text-xs text-gray-600">
                Powered by{" "}
                <a
                  href="https://discuze.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold hover:underline"
                >
                  Discuze
                </a>
              </p>
            </div>
          </div>
        </div>
      )}

    </>
  )
}

export default Getverified