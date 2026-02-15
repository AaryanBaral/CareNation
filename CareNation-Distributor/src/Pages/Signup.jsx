import { useNavigate } from "react-router-dom";
import { useAuth } from "../Components/Context/AuthContext";
import { useState } from "react";
import axios from "axios";
import "../styles/Signup.css";
import { toast } from "sonner";

export default function Signup() {
  const { setIsDistributor, token } = useAuth();
  const navigate = useNavigate();

  // Required (per DTO)
  const [citizenshipNo, setCitizenshipNo] = useState("");
  const [dob, setDob] = useState("");
  const [referalId, setReferalId] = useState(""); // Witness ID equivalent
  const [parentId, setParentId] = useState("");   // Location ID equivalent
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");

  // Files
  const [citizenshipFile, setCitizenshipFile] = useState(null); // required
  const [profilePicture, setProfilePicture] = useState(null);   // optional

  // Optional extras from DTO
  const [nomineeName, setNomineeName] = useState("");
  const [nomineeRelation, setNomineeRelation] = useState("");
  const [bankBranchName, setBankBranchName] = useState("");
  const [vatPanName, setVatPanName] = useState("");
  const [vatPanRegistrationNumber, setVatPanRegistrationNumber] = useState("");
  const [vatPanIssuedFrom, setVatPanIssuedFrom] = useState("");

  // Optional URL fields (if you want to prefill or let API write them after upload, you can omit)
  const [citizenshipImageUrl, setCitizenshipImageUrl] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleCitizenshipFile = (e) => setCitizenshipFile(e.target.files[0] || null);
  const handleProfilePicture = (e) => setProfilePicture(e.target.files[0] || null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    // Trim required fields
    const payload = {
      CitizenshipNo: citizenshipNo.trim(),
      DOB: dob.trim(),
      ReferalId: referalId.trim(),
      ParentId: parentId.trim(),
      AccountName: accountName.trim(),
      AccountNumber: accountNumber.trim(),
      BankName: bankName.trim(),
      // Optional:
      NomineeName: nomineeName.trim(),
      NomineeRelation: nomineeRelation.trim(),
      BankBranchName: bankBranchName.trim(),
      VatPanName: vatPanName.trim(),
      VatPanRegistrationNumber: vatPanRegistrationNumber.trim(),
      VatPanIssuedFrom: vatPanIssuedFrom.trim(),
      CitizenshipImageUrl: citizenshipImageUrl.trim(),
      ProfilePictureUrl: profilePictureUrl.trim(),
    };

    // Basic required validation
    if (
      !payload.CitizenshipNo ||
      !payload.DOB ||
      !payload.ReferalId ||
      !payload.ParentId ||
      !payload.AccountName ||
      !payload.AccountNumber ||
      !payload.BankName ||
      !citizenshipFile
    ) {
      setSubmitting(false);
      setError("Please fill all required fields and upload your citizenship document.");
      return;
    }

    const formData = new FormData();

    // Append DTO fields (names must match server DTO exactly)
    formData.append("CitizenshipNo", payload.CitizenshipNo);
    formData.append("DOB", payload.DOB);
    formData.append("ReferalId", payload.ReferalId);
    formData.append("ParentId", payload.ParentId);
    formData.append("AccountName", payload.AccountName);
    formData.append("AccountNumber", payload.AccountNumber);
    formData.append("BankName", payload.BankName);

    // Optional text fields only if present
    if (payload.NomineeName) formData.append("NomineeName", payload.NomineeName);
    if (payload.NomineeRelation) formData.append("NomineeRelation", payload.NomineeRelation);
    if (payload.BankBranchName) formData.append("BankBranchName", payload.BankBranchName);
    if (payload.VatPanName) formData.append("VatPanName", payload.VatPanName);
    if (payload.VatPanRegistrationNumber) formData.append("VatPanRegistrationNumber", payload.VatPanRegistrationNumber);
    if (payload.VatPanIssuedFrom) formData.append("VatPanIssuedFrom", payload.VatPanIssuedFrom);

    // Optional URL fields if you want to pass them (often backend fills these after upload)
    if (payload.CitizenshipImageUrl) formData.append("CitizenshipImageUrl", payload.CitizenshipImageUrl);
    if (payload.ProfilePictureUrl) formData.append("ProfilePictureUrl", payload.ProfilePictureUrl);

    // Files: parameter names must match action method parameters
    formData.append("citizenshipFile", citizenshipFile);
    if (profilePicture) formData.append("profilePicture", profilePicture);

    try {
      await axios.post(
        "http://localhost:5127/api/distributor/signup",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // do NOT set Content-Type manually
          },
        }
      );

      setIsDistributor(true);
      toast.success("Signup successful! Redirecting to dashboard...");
      navigate("/");
    } catch (err) {
      console.error(err);
      const apiMsg =
        err.response?.data?.message ||
        err.response?.data?.title ||
        err.response?.data ||
        "Signup failed";
      setError(apiMsg);
      toast.error(`Signup failed. ${apiMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="signup-container signup-fade-in">
      <h2 className="signup-title">Distributor Signup</h2>

      <form onSubmit={handleSubmit} className="signup-form-grid" autoComplete="off">
        {/* Column 1 */}
        <div className="signup-form-col">
          <div className="signup-form-group">
            <label className="signup-label" htmlFor="citizenshipNo">Citizenship No. *</label>
            <input
              className="signup-input"
              type="text"
              id="citizenshipNo"
              value={citizenshipNo}
              onChange={(e) => setCitizenshipNo(e.target.value)}
              required
            />
          </div>

          <div className="signup-form-group">
            <label className="signup-label" htmlFor="citizenshipFile">Upload Citizenship *</label>
            <input
              className="signup-input"
              type="file"
              id="citizenshipFile"
              accept="image/*,application/pdf"
              onChange={handleCitizenshipFile}
              required
            />
          </div>

          <div className="signup-form-group">
            <label className="signup-label" htmlFor="profilePicture">Profile Picture (optional)</label>
            <input
              className="signup-input"
              type="file"
              id="profilePicture"
              accept="image/*"
              onChange={handleProfilePicture}
            />
          </div>

          <div className="signup-form-group">
            <label className="signup-label" htmlFor="dob">DOB *</label>
            <input
              className="signup-input"
              type="date"
              id="dob"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Column 2 */}
        <div className="signup-form-col">
          <div className="signup-form-group">
            <label className="signup-label" htmlFor="accountName">Account Name *</label>
            <input
              className="signup-input"
              type="text"
              id="accountName"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              required
            />
          </div>

          <div className="signup-form-group">
            <label className="signup-label" htmlFor="accountNumber">Account Number *</label>
            <input
              className="signup-input"
              type="text"
              id="accountNumber"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              required
            />
          </div>

          <div className="signup-form-group">
            <label className="signup-label" htmlFor="bankName">Bank Name *</label>
            <input
              className="signup-input"
              type="text"
              id="bankName"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              required
            />
          </div>

          <div className="signup-form-group">
            <label className="signup-label" htmlFor="bankBranchName">Bank Branch (optional)</label>
            <input
              className="signup-input"
              type="text"
              id="bankBranchName"
              value={bankBranchName}
              onChange={(e) => setBankBranchName(e.target.value)}
            />
          </div>
        </div>

        {/* Column 3 */}
        <div className="signup-form-col">
          <div className="signup-form-group">
            <label className="signup-label" htmlFor="parentId">Parent ID (Location ID) *</label>
            <input
              className="signup-input"
              type="text"
              id="parentId"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              required
            />
          </div>

          <div className="signup-form-group">
            <label className="signup-label" htmlFor="referalId">Referral ID (Witness ID) *</label>
            <input
              className="signup-input"
              type="text"
              id="referalId"
              value={referalId}
              onChange={(e) => setReferalId(e.target.value)}
              required
            />
          </div>

          <div className="signup-form-group">
            <label className="signup-label" htmlFor="nomineeName">Nominee Name (optional)</label>
            <input
              className="signup-input"
              type="text"
              id="nomineeName"
              value={nomineeName}
              onChange={(e) => setNomineeName(e.target.value)}
            />
          </div>

          <div className="signup-form-group">
            <label className="signup-label" htmlFor="nomineeRelation">Nominee Relation (optional)</label>
            <input
              className="signup-input"
              type="text"
              id="nomineeRelation"
              value={nomineeRelation}
              onChange={(e) => setNomineeRelation(e.target.value)}
            />
          </div>
        </div>

        {/* Column 4 (VAT/PAN + optional URLs) */}
        <div className="signup-form-col">
          <div className="signup-form-group">
            <label className="signup-label" htmlFor="vatPanName">VAT/PAN Name (optional)</label>
            <input
              className="signup-input"
              type="text"
              id="vatPanName"
              value={vatPanName}
              onChange={(e) => setVatPanName(e.target.value)}
            />
          </div>

          <div className="signup-form-group">
            <label className="signup-label" htmlFor="vatPanRegistrationNumber">VAT/PAN Registration No. (optional)</label>
            <input
              className="signup-input"
              type="text"
              id="vatPanRegistrationNumber"
              value={vatPanRegistrationNumber}
              onChange={(e) => setVatPanRegistrationNumber(e.target.value)}
            />
          </div>

          <div className="signup-form-group">
            <label className="signup-label" htmlFor="vatPanIssuedFrom">VAT/PAN Issued From (optional)</label>
            <input
              className="signup-input"
              type="text"
              id="vatPanIssuedFrom"
              value={vatPanIssuedFrom}
              onChange={(e) => setVatPanIssuedFrom(e.target.value)}
            />
          </div>
        </div>

        <div className="signup-form-actions">
          <button className="signup-button" type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Signup"}
          </button>
          {error && <p className="signup-error-text">{error}</p>}
        </div>
      </form>
    </div>
  );
}
