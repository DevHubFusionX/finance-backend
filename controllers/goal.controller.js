const Goal = require('../models/Goal');

exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createGoal = async (req, res) => {
  try {
    const { name, targetAmount, currentAmount, deadline, category, priority, description } = req.body;
    
    const goal = new Goal({
      userId: req.user.id,
      name,
      targetAmount,
      currentAmount: currentAmount || 0,
      deadline,
      category,
      priority,
      description
    });

    await goal.save();
    res.status(201).json(goal);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create goal', error: error.message });
  }
};

exports.updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const goal = await Goal.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      updates,
      { new: true, runValidators: true }
    );

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    res.json(goal);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update goal', error: error.message });
  }
};

exports.deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;

    const goal = await Goal.findOneAndDelete({ _id: id, userId: req.user.id });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete goal', error: error.message });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    const goal = await Goal.findOne({ _id: id, userId: req.user.id });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    goal.currentAmount = amount;
    
    if (goal.currentAmount >= goal.targetAmount) {
      goal.status = 'completed';
    }

    await goal.save();
    res.json(goal);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update progress', error: error.message });
  }
};
