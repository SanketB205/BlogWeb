import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};

export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        // Create new user
        user = new User({
            username,
            email,
            password
        });

        await user.save();

        const token = generateToken(user);

        res.status(201).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Registration Error details:", error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user);

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).select('-password -email');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({
            _id: user._id,
            username: user.username,
            followersCount: user.followers.length,
            followingCount: user.following.length,
            followers: user.followers
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const toggleFollow = async (req, res) => {
    try {
        const { userId } = req.params;   // user to follow/unfollow
        const myId = req.user.id;

        if (userId === myId) {
            return res.status(400).json({ message: "You can't follow yourself" });
        }

        const targetUser = await User.findById(userId);
        const me = await User.findById(myId);

        if (!targetUser) return res.status(404).json({ message: 'User not found' });

        const alreadyFollowing = me.following.some(id => id.toString() === userId);

        if (alreadyFollowing) {
            // Unfollow
            me.following = me.following.filter(id => id.toString() !== userId);
            targetUser.followers = targetUser.followers.filter(id => id.toString() !== myId);
        } else {
            // Follow
            me.following.push(userId);
            targetUser.followers.push(myId);
        }

        await me.save();
        await targetUser.save();

        res.json({
            following: !alreadyFollowing,
            followersCount: targetUser.followers.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getFollowers = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).populate('followers', 'username _id');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user.followers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getFollowing = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).populate('following', 'username _id');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user.following);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
