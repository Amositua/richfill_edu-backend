
// exports.getUserProfile = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select('-password');
//     if (!user) return res.status(404).json({ error: 'User not found' });

//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
// exports.updateUserProfile = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
//     const
//     user = await User.findById(req.user.id);
//     if (!user) return res.status(404).json({ error: 'User not found' });
//     user.name = name || user.name;
//     user.email = email || user.email;
//     if (password) {
//       user.password = password;
//     }   
//     await user.save();
//     res.json({ message: 'Profile updated successfully' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// }
// exports.deleteUser = async (req, res) => {
//   try {
//     const user = await User.findByIdAndDelete(req.user.id);
//     if (!user) return res.status(404).json({ error: 'User not found' });

//     res.json({ message: 'User deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// }
// exports.getAllUsers = async (req, res) => {
//   try {
//     const users = await User.find().select('-password');
//     res.json(users);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
// exports.getUserById = async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id).select('-password');
//     if (!user) return res.status(404).json({ error: 'User not found' });

//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
// exports.updateUserRole = async (req, res) => {
//   try {
//     const { role } = req.body;
//     if (!['student', 'teacher', 'admin'].includes(role)) {
//       return res.status(400).json({ error: 'Invalid role' });
//     }

//     const user = await User.findByIdAndUpdate(
//       req.params.id,
//       { role },
//       { new: true, runValidators: true }
//     ).select('-password');
    
//     if (!user) return res.status(404).json({ error: 'User not found' });

//     res.json({ message: 'User role updated successfully', user });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
// exports.changePassword = async (req, res) => {
//   try {
//     const { currentPassword, newPassword } = req.body;
//     const user = await User.findById(req.user.id);
//     if (!user) return res.status(404).json({ error: 'User not found' });

//     const isMatch = await user.comparePassword(currentPassword);
//     if (!isMatch) return res.status(401).json({ error: 'Current password is incorrect' });

//     user.password = newPassword;
//     await user.save();

//     res.json({ message: 'Password changed successfully' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
// exports.forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;
//     const user = await User.find

