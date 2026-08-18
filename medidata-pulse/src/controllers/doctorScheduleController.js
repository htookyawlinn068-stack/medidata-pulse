const DoctorSchedule = require('../models/DoctorSchedule');

// ဆရာဝန်၏ Duty ချိန်ဇယားများကို ရယူခြင်း
const getDoctorSchedules = async (req, res) => {
    try {
        const doctorId = req.user.id;
        const schedules = await DoctorSchedule.find({ doctor_id: doctorId }).sort({ duty_date: 1 }).lean();
        const formatted = schedules.map(s => ({ ...s, id: s._id }));
        res.status(200).json({ success: true, schedules: formatted });
    } catch (error) {
        console.error('Get Schedules Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Duty ချိန်ဇယားအသစ် ထည့်သွင်းခြင်း သို့မဟုတ် ရှိပြီးသားရက်ကို ပြင်ဆင်ခြင်း (Upsert)
const upsertDoctorSchedule = async (req, res) => {
    try {
        const doctorId = req.user.id;
        const { duty_date, start_time, end_time, status } = req.body;

        const startDate = new Date(duty_date);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(duty_date);
        endDate.setHours(23, 59, 59, 999);

        const updatedSchedule = await DoctorSchedule.findOneAndUpdate(
            { 
                doctor_id: doctorId, 
                duty_date: { $gte: startDate, $lte: endDate } 
            },
            { 
                duty_date: startDate, 
                start_time, 
                end_time, 
                status: status || 'Available' 
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        const obj = updatedSchedule.toObject();
        return res.status(200).json({
            success: true,
            message: 'Duty ချိန်ဇယား အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ။',
            schedule: { ...obj, id: obj._id }
        });
    } catch (error) {
        console.error('Upsert Schedule Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Duty ချိန်ဇယား တစ်ခုကို ဖျက်ခြင်း
const deleteDoctorSchedule = async (req, res) => {
    try {
        const doctorId = req.user.id;
        const { id } = req.params;

        await DoctorSchedule.findOneAndDelete({ _id: id, doctor_id: doctorId });
        res.status(200).json({ success: true, message: 'Duty ချိန်ဇယား ဖျက်ပြီးပါပြီ။' });
    } catch (error) {
        console.error('Delete Schedule Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    getDoctorSchedules,
    upsertDoctorSchedule,
    deleteDoctorSchedule
};