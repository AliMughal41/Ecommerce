const Address = require('../models/Address');

// Get all addresses for logged-in customer
const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ customerId: req.customer._id }).sort({ isDefault: -1, createdAt: -1 });
    res.status(200).json({ success: true, addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch addresses.' });
  }
};

// Get single address
const getAddress = async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, customerId: req.customer._id });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found.' });
    }
    res.status(200).json({ success: true, address });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch address.' });
  }
};

// Create address
const createAddress = async (req, res) => {
  try {
    const { label, fullName, phone, email, address1, address2, city, province, postal, country, isDefault } = req.body;
    if (!fullName || !phone || !address1 || !city || !province || !country) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields.' });
    }
    if (fullName.length > 100) return res.status(400).json({ success: false, message: 'Name is too long.' });
    if (phone.length > 20) return res.status(400).json({ success: false, message: 'Phone number is too long.' });
    if (address1.length > 200) return res.status(400).json({ success: false, message: 'Address is too long.' });
    if (city.length > 100) return res.status(400).json({ success: false, message: 'City name is too long.' });

    const address = await Address.create({
      customerId: req.customer._id,
      label: label ? String(label).trim() : 'home',
      fullName: String(fullName).trim(),
      phone: String(phone).trim(),
      email: email ? String(email).trim() : '',
      address1: String(address1).trim(),
      address2: address2 ? String(address2).trim() : '',
      city: String(city).trim(),
      province: String(province).trim(),
      postal: postal ? String(postal).trim() : '',
      country: String(country).trim(),
      isDefault: Boolean(isDefault),
    });
    res.status(201).json({ success: true, address });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create address.' });
  }
};

// Update address
const updateAddress = async (req, res) => {
  try {
    let address = await Address.findOne({ _id: req.params.id, customerId: req.customer._id });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found.' });
    }
    const { label, fullName, phone, email, address1, address2, city, province, postal, country, isDefault } = req.body;
    if (fullName !== undefined) address.fullName = String(fullName).trim();
    if (phone !== undefined) address.phone = String(phone).trim();
    if (email !== undefined) address.email = String(email).trim();
    if (address1 !== undefined) address.address1 = String(address1).trim();
    if (address2 !== undefined) address.address2 = String(address2).trim();
    if (city !== undefined) address.city = String(city).trim();
    if (province !== undefined) address.province = String(province).trim();
    if (postal !== undefined) address.postal = String(postal).trim();
    if (country !== undefined) address.country = String(country).trim();
    if (label !== undefined) address.label = String(label).trim();
    if (isDefault !== undefined) address.isDefault = Boolean(isDefault);
    await address.save();
    res.status(200).json({ success: true, address });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update address.' });
  }
};

// Delete address
const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, customerId: req.customer._id });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found.' });
    }
    res.status(200).json({ success: true, message: 'Address deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete address.' });
  }
};

// Set default address
const setDefaultAddress = async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, customerId: req.customer._id });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found.' });
    }
    await Address.updateMany({ customerId: req.customer._id }, { isDefault: false });
    address.isDefault = true;
    await address.save();
    res.status(200).json({ success: true, address });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to set default address.' });
  }
};

module.exports = { getAddresses, getAddress, createAddress, updateAddress, deleteAddress, setDefaultAddress };
