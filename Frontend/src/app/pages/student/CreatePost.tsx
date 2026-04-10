import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { ArrowLeft, Sparkles, Send, FileText, Image as ImageIcon, Code, Type, Eye, Edit3, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Input } from '../../components/ui/input';
import { mockCommunities } from '../../data/mockData';
import { aiAPI } from '../../../services/aiAPI';
import { discussionAPI } from '../../../services/discussionAPI';

export default function CreatePost() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    community: '',
    category: '',
  });

  const [contentHtml, setContentHtml] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const editorRef = useState<HTMLDivElement | null>(null)[0];

  let titleError = "";
  if (formData.title.length > 0) {
    if (formData.title.trim().length < 5) {
      titleError = "Title must be at least 5 characters.";
    } else if (/^\d+$/.test(formData.title)) {
      titleError = "Title cannot be numbers only.";
    } else if (!/[aeiouAEIOU]/.test(formData.title)) {
      titleError = "Title must contain meaningful words (vowels required).";
    } else if (formData.title.length > 15 && !/\s/.test(formData.title)) {
      titleError = "Please use spaces between words.";
    }
  }

  let contentError = "";
  const plainContent = contentHtml.replace(/<[^>]*>/g, '').trim();
  if (plainContent.length > 0) {
    if (plainContent.length < 15) {
      contentError = "Content must be at least 15 characters long.";
    } else if (/^\d+$/.test(plainContent)) {
      contentError = "Content cannot be numbers only.";
    } else if (!/[aeiouAEIOU]/.test(plainContent)) {
      contentError = "Content must contain meaningful words.";
    } else if (plainContent.length > 25 && !/\s/.test(plainContent)) {
      contentError = "Please use spaces between words.";
    }
  }

  const handleEnhance = () => {
    const text = document.getElementById('rich-editor')?.innerText || "";
    if (!text.trim()) {
      toast.error('Please write some content first!');
      return;
    }
    toast.promise(
      new Promise(resolve => setTimeout(() => {
        const categoryLabel = formData.category || 'academic';

        // Professional AI Rewrite Logic
        const lines = text.split('\n').filter(l => l.trim() && !l.includes('Professional Draft'));
        const intro = `I am writing to seek collaboration regarding ${categoryLabel}. `;
        const professionalText = `
          <div class="p-6 bg-white border-2 border-indigo-100 rounded-2xl shadow-sm my-4">
            <p class="text-indigo-600 font-bold mb-2">✨ AI Professional Draft</p>
            <p class="mb-4">${intro}</p>
            <ul class="list-disc pl-5 space-y-2 mb-4">
              ${lines.map(l => `<li>${l}</li>`).join('')}
            </ul>
            <p>Looking forward to the community's insights.</p>
          </div>
          <p><br/></p>
        `;

        const editor = document.getElementById('rich-editor');
        if (editor) {
          editor.innerHTML = professionalText;
          setContentHtml(editor.innerHTML);
        }

        resolve(true);
      }, 2000)),
      {
        loading: 'AI is analyzing your content...',
        success: 'Post magically enhanced!',
        error: 'Failed to enhance.'
      }
    );
  };

  // Toolbar action helpers

  const handleToolbarAction = (type: 'bold' | 'italic' | 'code' | 'image') => {
    const editor = document.getElementById('rich-editor');
    if (!editor) return;

    editor.focus();

    if (type === 'bold') {
      document.execCommand('bold', false);
    } else if (type === 'italic') {
      document.execCommand('italic', false);
    } else if (type === 'code') {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const codeBlock = document.createElement('pre');
        codeBlock.className = 'bg-gray-900 text-gray-100 p-4 rounded-xl my-4 font-mono text-sm overflow-x-auto';
        codeBlock.innerHTML = selection.toString() || 'code here';
        range.deleteContents();
        range.insertNode(codeBlock);
      }
    } else if (type === 'image') {
      document.getElementById('photo-upload')?.click();
    }

    // Sync state
    setContentHtml(editor.innerHTML);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file type. Please upload an image.');
      return;
    }

    toast.promise(
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          const imgHtml = `<div class="my-4 relative group inline-block max-w-full">
            <img 
              src="${base64}" 
              class="rounded-xl shadow-sm max-w-full max-h-[300px] h-auto border-2 border-white transition-all cursor-default" 
              alt="Uploaded photo"
            />
            <button 
              type="button"
              onclick="this.parentElement.remove()"
              class="absolute top-3 right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-red-600 scale-90 group-hover:scale-100"
              title="Delete Photo"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </button>
          </div><p><br/></p>`;

          const editor = document.getElementById('rich-editor');
          if (editor) {
            // Correctly append the image to the end of the content
            const space = editor.innerHTML.trim().length > 0 ? '<p><br/></p>' : '';
            editor.innerHTML = editor.innerHTML + space + imgHtml;
            setContentHtml(editor.innerHTML);

            // Auto-scroll to bottom
            setTimeout(() => {
              editor.scrollTop = editor.scrollHeight;
            }, 100);
          }
          resolve(true);
        };
        reader.onerror = () => reject();
        reader.readAsDataURL(file);
      }),
      {
        loading: 'Uploading your photo...',
        success: 'Your actual photo added to the post!',
        error: 'Upload failed',
      }
    );
  };

  const hasContent = plainContent.length > 0 || contentHtml.includes('<img');

  const isFormValid =
    formData.title.trim().length > 0 && titleError === "" &&
    hasContent && contentError === "" &&
    formData.community !== "" &&
    formData.category !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!isFormValid) {
      if (titleError) toast.error(titleError);
      else if (contentError) toast.error(contentError);
      else if (!hasContent) toast.error("Please add some text or an image.");
      else toast.error("Please fill in all required fields (Community & Category).");
      return;
    }

    setIsSubmitting(true);
    try {
      const plainText = document.getElementById('rich-editor')?.innerText || "";

      // 1. AI Moderation Filter
      const moderation = await aiAPI.checkModeration(formData.title, plainText).catch(() => null);

      if (moderation && (moderation.isFlagged || moderation.severity >= 2 || (moderation.issues && moderation.issues.length > 0))) {
        toast.error("Your post was filtered: it contains inappropriate content.");
        setIsSubmitting(false);
        return;
      }

      // 2. Submit to backend
      const selectedCommunityObj = mockCommunities.find(c => c.id === formData.community);

      await discussionAPI.createDiscussion({
        title: formData.title,
        content: contentHtml, // Store as HTML
        category: formData.category,
        communityId: formData.community,
        communityName: selectedCommunityObj?.name || 'Unknown Community'
      });

      toast.success("Post published successfully!");
      navigate('/discussions');
    } catch (err) {
      toast.error("Failed to publish post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-full font-sans justify-center pb-20 relative overflow-hidden bg-[#fafbff]">
      {/* Dynamic Background Blobs */}
      <div className="absolute top-10 -left-20 w-80 h-80 bg-blue-100/40 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-40 -right-20 w-96 h-96 bg-indigo-100/40 rounded-full blur-[120px] pointer-events-none animate-pulse delay-700"></div>

      <div className="flex-1 max-w-[900px] px-8 py-10 lg:px-12 relative h-full z-10">

        <button onClick={() => navigate(-1)} disabled={isSubmitting} className="absolute top-8 left-8 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md shadow-sm flex items-center justify-center text-[#64748B] hover:text-[#5B4FDB] transition-all hover:scale-110 border border-white/60 disabled:opacity-50">
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="pt-10 max-w-3xl mx-auto">
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 via-blue-600 to-indigo-500 tracking-tight pb-2">
              Create new post
            </h1>
            <p className="text-[#64748B] text-lg mt-4 font-medium max-w-md mx-auto leading-relaxed">
              Share knowledge or ask questions within your academic community.
            </p>
          </div>

          <motion.form
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="backdrop-blur-xl bg-white/70 rounded-[2.5rem] p-8 md:p-12 shadow-[0_30px_100px_-20px_rgba(0,0,0,0.06)] border border-white/40 relative overflow-hidden ring-1 ring-black/5"
            onSubmit={handleSubmit}
          >
            {/* Author Info */}
            <div className="flex items-center gap-4 mb-10 relative z-10">
              <div className="relative">
                <Avatar className="w-14 h-14 rounded-2xl shadow-md border-2 border-white">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold">{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <h5 className="font-bold text-[#1E293B] text-lg tracking-tight">IT245671234</h5>
                <p className="text-[10px] text-indigo-600 font-black uppercase tracking-[0.2em] mt-0.5">Author Identity Verified</p>
              </div>
            </div>
            {/* Form Fields */}
            <div className="space-y-6 relative z-10">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-[#1E293B] mb-2 ml-1">Community Group</label>
                  <select
                    value={formData.community}
                    onChange={(e) => setFormData({ ...formData, community: e.target.value })}
                    className="w-full h-14 bg-[#F8FAFC] border-none text-[#475569] font-medium text-[15px] rounded-2xl px-5 appearance-none hover:bg-[#EEF2F6] transition-colors focus:ring-2 focus:ring-indigo-100 outline-none cursor-pointer shadow-inner"
                    disabled={isSubmitting}
                    required
                  >
                    <option value="" disabled>Select a community...</option>
                    {mockCommunities.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1E293B] mb-2 ml-1">Category Select</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-14 bg-[#F8FAFC] border-none text-[#475569] font-medium text-[15px] rounded-2xl px-5 appearance-none hover:bg-[#EEF2F6] transition-colors focus:ring-2 focus:ring-indigo-100 outline-none cursor-pointer shadow-inner"
                    disabled={isSubmitting}
                    required
                  >
                    <option value="" disabled>Select a category...</option>
                    <option value="Kuppi">Kuppi</option>
                    <option value="Programming">Programming</option>
                    <option value="Projects">Projects</option>
                    <option value="Events">Events</option>
                    <option value="Career">Career</option>
                    <option value="General">General</option>
                    <option value="Research">Research</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2 ml-1">
                  <label className="block text-sm font-bold text-[#1E293B]">Title</label>
                  {titleError && <span className="text-xs font-bold text-red-500">{titleError}</span>}
                </div>
                <div className="relative">
                  <Input
                    placeholder="E.g., Question about upcoming final exam format"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={`h-14 bg-[#F8FAFC] border-none rounded-2xl px-5 text-[#1E293B] font-bold text-[15px] placeholder:text-[#94A3B8] focus-visible:ring-2 focus-visible:ring-indigo-100 shadow-inner ${titleError ? 'ring-2 ring-red-200 bg-red-50' : ''}`}
                    autoFocus
                    required
                    maxLength={30}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2 ml-1">
                  <div className="flex items-center gap-2">
                    <label className="block text-sm font-bold text-[#1E293B]">Question</label>
                    {contentError && <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100 shadow-sm">{contentError}</span>}
                  </div>
                  <button type="button" onClick={handleEnhance} className="text-xs font-bold text-white flex items-center gap-1.5 transition-all bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:scale-105 active:scale-95">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Enhance
                  </button>
                </div>

                <div className={`bg-[#F8FAFC]/50 backdrop-blur-sm rounded-[2rem] border overflow-hidden transition-all duration-300 ${contentError ? 'border-rose-300 ring-2 ring-rose-100 shadow-[inset_0_2px_10px_rgba(244,63,94,0.08)]' : 'border-gray-100 shadow-inner'}`}>
                  <div className="bg-white/50 backdrop-blur-sm border-b border-gray-100 p-2 flex gap-4 items-center px-6 h-14">
                    <input
                      type="file"
                      id="photo-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    <button type="button" onClick={() => document.getElementById('photo-upload')?.click()} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-indigo-600 font-bold hover:bg-indigo-50 transition-all border border-indigo-100 shadow-sm text-xs" title="Add Image">
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Add Photo</span>
                    </button>
                  </div>

                  <div
                    id="rich-editor"
                    contentEditable={!isSubmitting}
                    onInput={(e) => setContentHtml(e.currentTarget.innerHTML)}
                    onBlur={(e) => setContentHtml(e.currentTarget.innerHTML)}
                    className={`w-full min-h-[350px] px-6 py-6 text-[#475569] font-medium outline-none text-[15px] leading-relaxed relative empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none`}
                    data-placeholder="Share your thoughts, ask a question, or attach an image..."
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-10 flex items-center justify-between relative z-10 pt-6 border-t border-gray-50">
              <button type="button" onClick={() => navigate(-1)} disabled={isSubmitting} className="px-6 py-3.5 text-[#64748B] font-bold text-sm hover:text-[#1E293B] transition-colors disabled:opacity-50">
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !isFormValid}
                className="px-8 py-3.5 bg-[#5B4FDB] text-white font-bold text-sm rounded-2xl shadow-[0_10px_25px_-5px_rgba(91,79,219,0.4)] hover:shadow-[0_15px_35px_-5px_rgba(91,79,219,0.5)] transition-all flex items-center gap-2 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <>Creating Post...</>
                ) : (
                  <>Create Post <Send className="w-4 h-4" /></>
                )}
              </button>
            </div>

          </motion.form>
        </div>
      </div>
    </div>
  );
}
