import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { ArrowLeft, Send, Image as ImageIcon, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Input } from '../../components/ui/input';
import { mockCommunities } from '../../data/mockData';
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
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  let titleError = "";
  // (validation logic remains same)
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file type. Please upload an image.');
      return;
    }

    if (images.length >= 4) {
      toast.error('Maximum 4 photos allowed per post.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImages(prev => [...prev, base64]);
      toast.success('Photo added to gallery!');
    };
    reader.readAsDataURL(file);
    // Reset input
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const hasContent = plainContent.length > 0 || images.length > 0;

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
      const selectedCommunity = mockCommunities.find((community) => community.id === formData.community);

      if (!selectedCommunity) {
        toast.error('Please select a valid community.');
        return;
      }

      if (user?.id) {
        localStorage.setItem('userId', user.id);
      }
      if (user?.studentId || user?.name) {
        localStorage.setItem('userName', user?.studentId || user?.name || 'Student');
      }
      if (user?.university) {
        localStorage.setItem('userUniversity', user.university);
      }
      if (user?.role) {
        localStorage.setItem('userRole', user.role);
      }

      const payload = {
        title: formData.title.trim(),
        content: contentHtml.trim(),
        communityId: formData.community,
        communityName: selectedCommunity.name,
        category: formData.category,
        images,
      };

      const response = await discussionAPI.createDiscussion(payload);
      toast.success(response.message || 'Post published successfully!');
      navigate('/discussions');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to publish post. Please try again.');
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
                <h5 className="font-bold text-[#1E293B] text-lg tracking-tight">{user?.studentId || user?.id || 'Unknown'}</h5>
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
                    placeholder="Enter your discussion title..."
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
                <div className="flex items-center gap-2 mb-2 ml-1">
                  <label className="block text-sm font-bold text-[#1E293B]">Question</label>
                  {contentError && <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100 shadow-sm">{contentError}</span>}
                </div>

                {/* Proper Photo Gallery Preview */}
                <AnimatePresence>
                  {images.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex gap-4 mb-6 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-indigo-100"
                    >
                      {images.map((img, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="relative flex-shrink-0 group"
                        >
                          <img
                            src={img}
                            alt={`Upload ${idx}`}
                            className="w-24 h-24 object-cover rounded-2xl shadow-sm border-2 border-white ring-1 ring-gray-100"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </motion.div>
                      ))}
                      {images.length < 4 && (
                        <button
                          type="button"
                          onClick={() => document.getElementById('photo-upload')?.click()}
                          className="w-24 h-24 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition-all bg-gray-50/50"
                        >
                          <Plus className="w-6 h-6 mb-1" />
                          <span className="text-[10px] font-bold">Add More</span>
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

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
                      <span>{images.length > 0 ? 'Add More' : 'Add Photo'}</span>
                    </button>
                  </div>

                  <div
                    id="rich-editor"
                    contentEditable={!isSubmitting}
                    onInput={(e) => setContentHtml(e.currentTarget.innerHTML)}
                    onBlur={(e) => setContentHtml(e.currentTarget.innerHTML)}
                    className={`w-full min-h-[350px] px-6 py-6 text-[#475569] font-medium outline-none text-[15px] leading-relaxed relative empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none`}
                    data-placeholder="Share your thoughts or ask a question..."
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
