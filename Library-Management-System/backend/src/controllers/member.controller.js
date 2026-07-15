import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Transaction } from "../models/transaction.model.js";
import { Fine } from "../models/fine.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createMember = asyncHandler(async (req, res) => {
    const { name, email, password, phone, address } = req.body;

    // 1. Required fields 
    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Name, email and password are required"
        });
    }

    // 2. Check duplicate email 
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(409).json({
            success: false,
            message: "User with this email already exists"
        });
    }

    // 3. Generate unique membershipId 
    let membershipId;
    let isUnique = false;

    while (!isUnique) {
        // LIB- + 6 random chars from a new ObjectId
        membershipId = `LIB-${new mongoose.Types.ObjectId()
            .toString()
            .slice(-6)
            .toUpperCase()}`;

        // keep regenerating until guaranteed unique
        const existing = await User.findOne({ membershipId });
        if (!existing) isUnique = true;
    }

    // 4. Create member — role locked to 'member'
    const member = await User.create({
        name,
        email,
        password,       
        phone,
        address,
        membershipId,
        role: 'member', // librarian cannot assign admin/librarian role here
    });

    const createdMember = await User.findById(member._id)
        .select('-password -refreshToken');

    return res.status(201).json({
        success: true,
        message: "Member registered successfully",
        data: createdMember
    });
});

const getAllMembers = asyncHandler(async (req, res) => {
    const {
        search,
        isActive,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        order = 'desc'
    } = req.query;

    const query = { role: 'member' };

    if (search) {
        query.$or = [
            { name:  { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { membershipId: { $regex: search, $options: 'i' } }
        ]
    }

    if (isActive !== undefined) {
        query.isActive = isActive === 'true';
    }

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;
    const sortObj  = { [sortBy]: order === 'asc' ? 1 : -1 };

    const [members, total] = await Promise.all([
        User.find(query)
            .select('-password -refreshToken')
            .sort(sortObj)
            .skip(skip)
            .limit(limitNum),
        User.countDocuments(query)
    ]);

    return res.status(200).json({
        success: true,
        data: members,
        pagination: {
            total,
            page:        pageNum,
            limit:       limitNum,
            totalPages:  Math.ceil(total / limitNum),
            hasNextPage: pageNum < Math.ceil(total / limitNum),
            hasPrevPage: pageNum > 1
        }
    });
});

const getMemberById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid member ID"
        });
    }

    const member = await User.findOne({ _id: id, role: 'member' })
        .select('-password -refreshToken');

    if (!member || !member.isActive) {
        return res.status(404).json({
            success: false,
            message: "Member not found"
        });
    }

    return res.status(200).json({
        success: true,
        data: member
    });
});

const updateMember = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid member ID"
        });
    }

    const member = await User.findOne({ _id: id, role: 'member' });
    if (!member || !member.isActive) {
        return res.status(404).json({
            success: false,
            message: "Member not found"
        });
    }

    const { name, phone, address, borrowLimit } = req.body;

    const updateFields = {
        ...(name         !== undefined && { name }),
        ...(phone        !== undefined && { phone }),
        ...(address      !== undefined && { address }),
        ...(borrowLimit  !== undefined && { borrowLimit }),
    }

    if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({
            success: false,
            message: "No valid fields provided to update"
        });
    }

    const updatedMember = await User.findByIdAndUpdate(
        id,
        { $set: updateFields },
        { new: true, runValidators: true }
    ).select('-password -refreshToken');

    return res.status(200).json({
        success: true,
        message: "Member updated successfully",
        data: updatedMember
    });
});

const deactivateMember = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid member ID"
        });
    }

    const member = await User.findOne({ _id: id, role: 'member' });
    if (!member || !member.isActive) {
        return res.status(404).json({
            success: false,
            message: "Member not found"
        });
    }

    const activeBorrows = await Transaction.countDocuments({
        member: id,
        returnDate: null
    });

    if (activeBorrows > 0) {
        return res.status(400).json({
            success: false,
            message: `Cannot deactivate member. ${activeBorrows} ${activeBorrows === 1 ? 'book is' : 'books are'} currently issued`
        });
    }

    // also check unpaid fines
const pendingFines = await Fine.countDocuments({
    member: id,
    status: 'pending'
});

if (pendingFines > 0) {
    return res.status(400).json({
        success: false,
        message: `Cannot deactivate. Member has ${pendingFines} unpaid ${pendingFines === 1 ? 'fine' : 'fines'}`
    });
}

    await User.findByIdAndUpdate(id, { $set: { isActive: false } });

    return res.status(200).json({
        success: true,
        message: "Member deactivated successfully"
    });
});

const getMemberHistory = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid member ID"
        });
    }

    const member = await User.findOne({ _id: id, role: 'member' });
    if (!member) {
        return res.status(404).json({
            success: false,
            message: "Member not found"
        });
    }

    const {
        status,
        page  = 1,
        limit = 10,
        sortBy = 'createdAt',
        order  = 'desc'
    } = req.query;

    const query = { member: id };

    if (status) {
        query.status = status;
    }

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;
    const sortObj  = { [sortBy]: order === 'asc' ? 1 : -1 };

    const [transactions, total] = await Promise.all([
        Transaction.find(query)
            .populate('book', 'title isbn coverImage')
            .populate('issuedBy', 'name')
            .sort(sortObj)
            .skip(skip)
            .limit(limitNum),
        Transaction.countDocuments(query)
    ]);

    return res.status(200).json({
        success: true,
        data: transactions,
        pagination: {
            total,
            page:        pageNum,
            limit:       limitNum,
            totalPages:  Math.ceil(total / limitNum),
            hasNextPage: pageNum < Math.ceil(total / limitNum),
            hasPrevPage: pageNum > 1
        }
    });
});

export {
    createMember,
    getAllMembers,
    getMemberById,
    updateMember,
    deactivateMember,
    getMemberHistory
}