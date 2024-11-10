const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createTask = async (req, res) => {
    try {
        const { name, title, date } = req.body;
        const contentBlocks = JSON.parse(req.body.contentBlocks);

        const assignee = await prisma.assignee.findUnique({ where: { name } });
        if (!assignee) return res.status(404).json({ error: 'Assignee not found' });

        let updatedContent = contentBlocks.map((block, index) => {
            console.log("Type:", block.type)
            if (block.type === 'text') {
                return `<p>${block.content}</p>`;
            } else if (block.type === 'image') {
                const file = req.files.find(f => f.originalname === block.file);
                if (file) {
                    return `<img src="https://upload.albinhasanaj.com/uploads/${file.filename}" alt="Task Image" />`;
                }
            }
            return '';
        }).join('');

        const task = await prisma.task.create({
            data: {
                title,
                content: updatedContent,
                assigneeId: assignee.id,
                createdAt: new Date(date),
                status: 'NOT_DONE',
            },
        });

        return res.status(201).json({ message: 'Task created successfully' });
    } catch (error) {
        console.error('Error creating task:', error);
        return res.status(500).json({ error: 'Error creating task' });
    } finally {
        await prisma.$disconnect();
    }
};

exports.getAllTasks = async (req, res) => {
    try {
        const tasks = await prisma.task.findMany({
            include: { assignee: true },
        });

        const statusOrder = { 'ONGOING': 1, 'NOT_DONE': 2, 'COMPLETED': 3 };

        tasks.sort((a, b) => {
            if (statusOrder[a.status] === statusOrder[b.status]) {
                return new Date(a.createdAt) - new Date(b.createdAt);
            }
            return statusOrder[a.status] - statusOrder[b.status];
        });

        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Error fetching tasks' });
    } finally {
        await prisma.$disconnect();
    }
};

exports.getTaskById = async (req, res) => {
    const { id } = req.params;
    try {
        const task = await prisma.task.findUnique({
            where: { id: parseInt(id, 10) },
            include: { assignee: true },


        });
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json(task);
    } catch (error) {
        console.error('Error fetching task:', error);
        res.status(500).json({ error: 'Error fetching task' });
    } finally {
        await prisma.$disconnect();
    }
};

exports.getUserTasksByName = async (req, res) => {
    const { name } = req.params;
    try {
        const formattedName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
        const assignee = await prisma.assignee.findFirst({
            where: {
                name: {
                    equals: formattedName,
                },
            },
            include: { tasks: true },
        });

        if (!assignee) {
            console.log('Assignee not found');
            console.log("Name: ", name);
            return res.status(404).json({ error: 'Assignee not found' });
        }

        const statusOrder = { 'ONGOING': 1, 'NOT_DONE': 2, 'COMPLETED': 3 };

        //order by completed and then by date
        assignee.tasks.sort((a, b) => {
            if (statusOrder[a.status] === statusOrder[b.status]) {
                return new Date(a.createdAt) - new Date(b.createdAt);
            }
            return statusOrder[a.status] - statusOrder[b.status];
        });


        return res.json(assignee.tasks);
    } catch (error) {
        console.error('Error fetching user tasks:', error);
        return res.status(500).json({ error: 'Error fetching user tasks' });
    } finally {
        await prisma.$disconnect();
    }
};

exports.updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const taskId = parseInt(id, 10);

        if (isNaN(taskId)) {
            return res.status(400).json({ error: 'Invalid task ID' });
        }

        const task = await prisma.task.findUnique({
            where: { id: taskId },
        });

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        const newStatus = task.status === 'NOT_DONE' ? 'ONGOING' :
            task.status === 'ONGOING' ? 'COMPLETED' : 'NOT_DONE';

        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: { status: newStatus }, // Update the status field
        });

        return res.json(updatedTask);
    } catch (error) {
        console.error('Error updating task:', error);
        return res.status(500).json({ error: 'Error updating task' });
    } finally {
        await prisma.$disconnect();
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const taskId = parseInt(id, 10);

        if (isNaN(taskId)) {
            return res.status(400).json({ error: 'Invalid task ID' });
        }

        const task = await prisma.task.findUnique({
            where: { id: taskId },
        });

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        await prisma.task.delete({
            where: { id: taskId },
        });

        return res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        return res.status(500).json({ error: 'Error deleting task' });
    } finally {
        await prisma.$disconnect();
    }
};