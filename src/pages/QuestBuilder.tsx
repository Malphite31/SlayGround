import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Plus, Trash2, Save, FileEdit, HelpCircle, Variable, CheckSquare, Music, CheckCircle2 } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

type QuestionType = 'multiple-choice' | 'fill-blank' | 'true-false' | 'short-answer';

interface Problem {
    question: string;
    answer: string;
    type: QuestionType;
    choices?: string[];
    move?: string;
    songPart?: string;
}

export function QuestBuilder() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { quests, addQuest, updateQuest } = useGameStore();

    const isEditMode = !!id;
    const existingQuest = isEditMode ? quests.find(q => q.id === id) : null;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [musicUrl, setMusicUrl] = useState('');
    const [timerDuration, setTimerDuration] = useState(30);
    const [problems, setProblems] = useState<Problem[]>([
        { question: '', answer: '', type: 'multiple-choice', choices: ['', '', '', ''], move: '', songPart: '' },
    ]);

    // Load existing quest data in edit mode
    useEffect(() => {
        if (existingQuest) {
            setTitle(existingQuest.title);
            setDescription(existingQuest.description);
            setMusicUrl(existingQuest.musicUrl || '');
            setTimerDuration(existingQuest.timerDuration || 30);
            setProblems(existingQuest.problems.map(p => ({
                question: p.question,
                answer: p.answer,
                type: p.type,
                choices: p.choices || (p.type === 'true-false' ? ['True', 'False'] : p.type === 'multiple-choice' ? ['', '', '', ''] : undefined),
                move: p.move || '',
                songPart: p.songPart || '',
            })));
        }
    }, [existingQuest]);

    const addProblem = () => {
        setProblems([
            ...problems,
            { question: '', answer: '', type: 'multiple-choice', choices: ['', '', '', ''], move: '', songPart: '' }
        ]);
    };

    const removeProblem = (index: number) => {
        if (problems.length > 1) {
            setProblems(problems.filter((_, i) => i !== index));
        }
    };

    const updateProblem = (index: number, field: keyof Problem, value: any) => {
        const updated = [...problems];
        updated[index] = { ...updated[index], [field]: value };
        setProblems(updated);
    };

    const updateProblemType = (index: number, type: QuestionType) => {
        const updated = [...problems];
        updated[index].type = type;

        // Set appropriate choices based on type
        if (type === 'true-false') {
            updated[index].choices = ['True', 'False'];
        } else if (type === 'multiple-choice') {
            updated[index].choices = ['', '', '', ''];
        } else {
            updated[index].choices = undefined;
        }

        setProblems(updated);
    };

    const updateChoice = (problemIndex: number, choiceIndex: number, value: string) => {
        const updated = [...problems];
        if (updated[problemIndex].choices) {
            updated[problemIndex].choices![choiceIndex] = value;
            setProblems(updated);
        }
    };

    const handleSave = () => {
        if (!title.trim()) {
            alert('Please enter a quest title');
            return;
        }

        if (problems.some(p => !p.question.trim() || !p.answer.trim())) {
            alert('Please fill in all questions and answers');
            return;
        }

        if (problems.some(p => p.type === 'multiple-choice' && p.choices?.some(c => !c.trim()))) {
            alert('Please fill in all multiple choice options');
            return;
        }

        const questData = {
            title,
            description,
            musicUrl: musicUrl.trim() || undefined,
            timerDuration,
            problems: problems.map((p, i) => ({
                question: p.question,
                answer: p.answer,
                type: p.type,
                choices: p.choices,
                stage: i + 1,
                move: p.move?.trim() || undefined,
                songPart: p.songPart?.trim() || undefined,
            })),
        };

        if (isEditMode && id) {
            updateQuest(id, questData);
        } else {
            addQuest(questData);
        }

        navigate('/admin');
    };

    return (
        <div className="max-w-5xl mx-auto p-6 md:p-8 space-y-8 relative z-10">
            {/* Header */}
            <div className="flex items-center gap-6 animate-pop-in">
                <Button variant="ghost" onClick={() => navigate('/admin')} className="gap-2 text-slate-400 hover:text-white hover:bg-white/5">
                    <ArrowLeft className="w-5 h-5" /> Back to Command
                </Button>
                <div>
                    <h1 className="text-4xl md:text-5xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-secondary">
                        {isEditMode ? 'Modify Mission' : 'New Operation'}
                    </h1>
                    <p className="text-slate-400 mt-1 font-medium">Configure mission parameters and objectives.</p>
                </div>
            </div>

            {/* Quest Details Card */}
            <div className="glass-panel p-8 rounded-[2rem] space-y-6 border-white/10 relative overflow-hidden animate-pop-in [animation-delay:100ms]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-20 -mt-20"></div>

                <div className="flex items-center gap-3 mb-2">
                    <FileEdit className="w-6 h-6 text-primary" />
                    <h2 className="text-xl font-bold text-white">Mission Briefing</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Operation: Linear Equations"
                            className="w-full bg-surface border border-white/10 rounded-xl p-4 text-white text-lg font-bold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all placeholder:text-slate-600 focus:bg-surface/80"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1">Description</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Mission objectives..."
                            className="w-full bg-surface border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all placeholder:text-slate-600 focus:bg-surface/80"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1">
                        Timer Duration (seconds per question)
                    </label>
                    <input
                        type="number"
                        min="5"
                        max="180"
                        value={timerDuration}
                        onChange={(e) => setTimerDuration(Math.min(180, Math.max(5, parseInt(e.target.value) || 30)))}
                        className="w-full bg-surface border border-white/10 rounded-xl p-4 text-white text-lg font-bold focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/20 transition-all focus:bg-surface/80"
                    />
                    <p className="text-xs text-slate-500 ml-1">
                        Students will have {timerDuration} seconds to answer each question (5-180 seconds)
                    </p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-2">
                        <Music className="w-4 h-4 text-primary" />
                        YouTube Music URL (Optional)
                    </label>
                    <input
                        type="url"
                        value={musicUrl}
                        onChange={(e) => setMusicUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=... (for final performance)"
                        className="w-full bg-surface border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all placeholder:text-slate-600 focus:bg-surface/80 font-mono text-sm"
                    />
                    {musicUrl && (
                        <p className="text-xs text-green-400 ml-1 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Music will play during final performance
                        </p>
                    )}
                </div>
            </div>

            {/* Problems List */}
            <div className="space-y-6">
                <div className="flex items-center justify-between animate-pop-in [animation-delay:200ms]">
                    <h2 className="text-2xl font-heading font-bold flex items-center gap-3">
                        <span className="bg-surface border border-white/10 px-3 py-1 rounded-lg text-primary">{problems.length}</span>
                        Objectives
                    </h2>
                    <Button variant="outline" onClick={addProblem} className="gap-2 border-dashed border-white/20 hover:border-primary hover:bg-primary/10 text-slate-300 hover:text-primary">
                        <Plus className="w-5 h-5" /> Add Objective
                    </Button>
                </div>

                {problems.map((problem, index) => (
                    <div key={index} className="glass-panel p-8 rounded-[2rem] space-y-6 border-white/5 relative group animate-pop-in">
                        <div className="absolute top-4 left-4 text-[10rem] font-black text-white/[0.02] -z-10 leading-none select-none pointer-events-none">
                            {index + 1}
                        </div>

                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <h3 className="text-lg font-bold text-accent flex items-center gap-2">
                                <span className="bg-accent/10 px-2 py-1 rounded text-sm">Objective {index + 1}</span>
                            </h3>
                            {problems.length > 1 && (
                                <button
                                    onClick={() => removeProblem(index)}
                                    className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-slate-500 hover:text-red-400"
                                    title="Remove Objective"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        <div className="grid md:grid-cols-4 gap-6">
                            {/* Question Type - Span 1 */}
                            <div className="md:col-span-1 space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Type</label>
                                <div className="relative">
                                    <select
                                        value={problem.type}
                                        onChange={(e) => updateProblemType(index, e.target.value as QuestionType)}
                                        className="w-full bg-surface border border-white/10 rounded-xl p-3 text-white appearance-none focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/20 transition-all font-medium"
                                    >
                                        <option value="multiple-choice">Multiple Choice</option>
                                        <option value="true-false">True / False</option>
                                        <option value="fill-blank">Fill in Blank</option>
                                        <option value="short-answer">Short Answer</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        {problem.type === 'multiple-choice' && <CheckSquare className="w-4 h-4" />}
                                        {problem.type === 'true-false' && <CheckSquare className="w-4 h-4" />}
                                        {problem.type === 'fill-blank' && <HelpCircle className="w-4 h-4" />}
                                        {problem.type === 'short-answer' && <Variable className="w-4 h-4" />}
                                    </div>
                                </div>
                            </div>

                            {/* Question Text - Span 3 */}
                            <div className="md:col-span-3 space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Question Prompt</label>
                                <input
                                    type="text"
                                    value={problem.question}
                                    onChange={(e) => updateProblem(index, 'question', e.target.value)}
                                    placeholder={
                                        problem.type === 'fill-blank'
                                            ? 'e.g., The answer to 2x + 5 = 15 is ___'
                                            : 'e.g., Solve for x: 2x + 5 = 15'
                                    }
                                    className="w-full bg-surface border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/20 transition-all placeholder:text-slate-600 font-medium"
                                />
                            </div>
                        </div>

                        {/* Answer Choices Area */}
                        {(problem.type === 'multiple-choice' || problem.type === 'true-false') && problem.choices && (
                            <div className="bg-surface/30 p-4 rounded-xl border border-white/5 space-y-3">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Answer Options</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {problem.choices.map((choice, choiceIndex) => (
                                        <div key={choiceIndex} className="relative group/choice">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 pointer-events-none">
                                                {String.fromCharCode(65 + choiceIndex)}
                                            </span>
                                            <input
                                                type="text"
                                                value={choice}
                                                onChange={(e) => updateChoice(index, choiceIndex, e.target.value)}
                                                placeholder={problem.type === 'true-false' ? (choiceIndex === 0 ? 'True' : 'False') : `Option ${choiceIndex + 1}`}
                                                disabled={problem.type === 'true-false'}
                                                className={`w-full bg-background border border-white/10 rounded-lg py-2 pl-8 pr-3 text-sm text-white focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all ${choice === problem.answer ? 'border-green-500/50 bg-green-500/10' : ''
                                                    }`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Correct Answer Field */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-green-400 uppercase tracking-wider ml-1 flex items-center gap-1">
                                Correct Answer
                                {(problem.type === 'multiple-choice' || problem.type === 'true-false') &&
                                    <span className="text-slate-500 normal-case font-normal">(Paste exact text from options)</span>
                                }
                            </label>
                            <input
                                type="text"
                                value={problem.answer}
                                onChange={(e) => updateProblem(index, 'answer', e.target.value)}
                                placeholder="Exact answer match..."
                                className="w-full bg-green-500/5 border border-green-500/30 rounded-xl p-3 text-white font-bold focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all placeholder:text-green-500/30"
                            />
                        </div>

                        {/* Dance Move Fields */}
                        <div className="grid md:grid-cols-2 gap-4 bg-yellow-500/5 p-4 rounded-xl border border-yellow-500/20">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-yellow-400 uppercase tracking-wider ml-1 flex items-center gap-1">
                                    <Music className="w-3 h-3" />
                                    Dance Move (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={problem.move || ''}
                                    onChange={(e) => updateProblem(index, 'move', e.target.value)}
                                    placeholder="e.g., Moonwalk, Spin, Wave..."
                                    className="w-full bg-background border border-yellow-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/20 transition-all placeholder:text-slate-600"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-yellow-400 uppercase tracking-wider ml-1">
                                    Song Part (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={problem.songPart || ''}
                                    onChange={(e) => updateProblem(index, 'songPart', e.target.value)}
                                    placeholder="e.g., Verse 1, Chorus..."
                                    className="w-full bg-background border border-yellow-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/20 transition-all placeholder:text-slate-600"
                                />
                            </div>
                            {problem.move && (
                                <div className="md:col-span-2">
                                    <p className="text-xs text-yellow-400 flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" />
                                        This move will be unlocked when students answer correctly
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Action Bar */}
            <div className="sticky bottom-6 glass-panel p-4 rounded-2xl flex justify-between items-center shadow-2xl border-t border-white/20 backdrop-blur-2xl">
                <span className="text-slate-400 text-sm font-medium ml-2">
                    {problems.length} objective{problems.length !== 1 && 's'} configured
                </span>
                <div className="flex gap-4">
                    <Button variant="ghost" onClick={() => navigate('/admin')} className="text-slate-400 hover:text-white">
                        Cancel
                    </Button>
                    <Button variant="primary" glow onClick={handleSave} className="gap-2 px-8">
                        <Save className="w-5 h-5" />
                        {isEditMode ? 'Update Mission' : 'Save Mission'}
                    </Button>
                </div>
            </div>
        </div >
    );
}
