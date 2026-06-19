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