import { useState } from 'react';
import { useParams } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Send, Flag, Search } from 'lucide-react';
import { mockCommunities, mockMessages } from '../../data/mockData';
import { useAuthStore } from '../../stores/authStore';

export default function Chat() {
  const { communityId } = useParams();
  const { user } = useAuthStore();
  const [selectedCommunityId, setSelectedCommunityId] = useState(communityId || '1');
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedCommunity = mockCommunities.find((c) => c.id === selectedCommunityId);
  const filteredCommunities = mockCommunities.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (message.trim()) {
      // In a real app, this would send the message
      setMessage('');
    }
  };

  return (
    <div className="h-[calc(100vh-180px)] flex gap-4">
      {/* Chat List Sidebar */}
      <Card className="w-80 flex flex-col">
        <CardHeader>
          <CardTitle>Community Chats</CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-2 p-4">
          {filteredCommunities.map((community) => (
            <div
              key={community.id}
              onClick={() => setSelectedCommunityId(community.id)}
              className={`
                p-3 rounded-lg cursor-pointer transition-colors
                ${selectedCommunityId === community.id
                  ? 'bg-blue-50 border border-blue-200'
                  : 'hover:bg-gray-50 border border-transparent'
                }
              `}
            >
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium truncate">{community.name}</p>
                {community.id === '1' && (
                  <Badge variant="destructive" className="ml-2">3</Badge>
                )}
              </div>
              <p className="text-xs text-gray-600 truncate">
                {community.id === '1' ? 'John: Hey everyone! Anyone working on...' : 'No new messages'}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Chat Room */}
      <Card className="flex-1 flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{selectedCommunity?.name}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">{selectedCommunity?.memberCount} members</p>
            </div>
          </div>
        </CardHeader>

        {/* Messages */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {mockMessages.map((msg) => {
            const isOwnMessage = msg.senderId === user?.id;
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={msg.avatar} />
                  <AvatarFallback>{msg.sender.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className={`flex-1 max-w-md ${isOwnMessage ? 'items-end' : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{msg.sender}</span>
                    <span className="text-xs text-gray-500">{msg.timestamp}</span>
                  </div>
                  <div
                    className={`
                      p-3 rounded-lg
                      ${isOwnMessage
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                        : 'bg-gray-100'
                      }
                    `}
                  >
                    <p className="text-sm">{msg.message}</p>
                  </div>
                  {!isOwnMessage && (
                    <Button variant="ghost" size="sm" className="mt-1 h-6 px-2">
                      <Flag className="w-3 h-3 mr-1" />
                      <span className="text-xs">Report</span>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>

        {/* Message Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button
              onClick={handleSendMessage}
              className="bg-gradient-to-r from-blue-600 to-indigo-600"
              disabled={!message.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
